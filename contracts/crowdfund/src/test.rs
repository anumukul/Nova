#![cfg(test)]
use super::*;
use soroban_sdk::{testutils::Events, vec, Address, Env, IntoVal};

fn setup() -> (Env, Address, Address, Address) {
    let env = Env::default();
    env.mock_all_auths();

    let contract_id = env.register(CrowdfundContract, ());
    let beneficiary = Address::generate(&env);
    let contributor = Address::generate(&env);

    let token_admin = Address::generate(&env);
    let token = env.register_stellar_asset_contract_v2(token_admin.clone());
    let token_addr = token.address();

    env.ledger().set_timestamp(1000);

    (env, contract_id, beneficiary, contributor)
}

#[test]
fn test_initialize_success() {
    let (env, contract_id, beneficiary, _contributor) = setup();
    let token_admin = Address::generate(&env);
    let token = env.register_stellar_asset_contract_v2(token_admin.clone());
    let token_addr = token.address();

    let client = CrowdfundContractClient::new(&env, &contract_id);
    let result = client.initialize(&beneficiary, &token_addr, &1000000000i128, &1790035200u64);
    assert!(result.is_ok());

    let campaign = client.get_campaign().unwrap();
    assert_eq!(campaign.goal, 1000000000i128);
    assert_eq!(campaign.deadline, 1790035200u64);
    assert_eq!(campaign.total_raised, 0i128);
    assert_eq!(campaign.contributor_count, 0u32);
    assert_eq!(campaign.withdrawn, false);
}

#[test]
fn test_initialize_twice_errors() {
    let (env, contract_id, beneficiary, _contributor) = setup();
    let token_admin = Address::generate(&env);
    let token = env.register_stellar_asset_contract_v2(token_admin.clone());
    let token_addr = token.address();

    let client = CrowdfundContractClient::new(&env, &contract_id);
    client.initialize(&beneficiary, &token_addr, &1000000000i128, &1790035200u64).unwrap();

    let result = client.initialize(&beneficiary, &token_addr, &1000000000i128, &1790035200u64);
    assert_eq!(result, Err(Error::AlreadyInitialized));
}

#[test]
fn test_initialize_invalid_goal() {
    let (env, contract_id, beneficiary, _contributor) = setup();
    let token_admin = Address::generate(&env);
    let token = env.register_stellar_asset_contract_v2(token_admin.clone());
    let token_addr = token.address();

    let client = CrowdfundContractClient::new(&env, &contract_id);
    let result = client.initialize(&beneficiary, &token_addr, &0i128, &1790035200u64);
    assert_eq!(result, Err(Error::InvalidAmount));
}

#[test]
fn test_contribute_success() {
    let (env, contract_id, beneficiary, contributor) = setup();
    let token_admin = Address::generate(&env);
    let token = env.register_stellar_asset_contract_v2(token_admin.clone());
    let token_addr = token.address();

    let client = CrowdfundContractClient::new(&env, &contract_id);
    client.initialize(&beneficiary, &token_addr, &1000000000i128, &1790035200u64).unwrap();

    let token_client = token::StellarAssetClient::new(&env, &token_addr);
    token_client.mint(&contributor, &100000000i128);

    let result = client.contribute(&contributor, &50000000i128);
    assert!(result.is_ok());

    let campaign = client.get_campaign().unwrap();
    assert_eq!(campaign.total_raised, 50000000i128);
    assert_eq!(campaign.contributor_count, 1u32);

    let contribution = client.get_contribution(&contributor);
    assert_eq!(contribution, 50000000i128);
}

#[test]
fn test_contribute_multiple() {
    let (env, contract_id, beneficiary, contributor) = setup();
    let token_admin = Address::generate(&env);
    let token = env.register_stellar_asset_contract_v2(token_admin.clone());
    let token_addr = token.address();

    let client = CrowdfundContractClient::new(&env, &contract_id);
    client.initialize(&beneficiary, &token_addr, &1000000000i128, &1790035200u64).unwrap();

    let token_client = token::StellarAssetClient::new(&env, &token_addr);
    token_client.mint(&contributor, &200000000i128);

    client.contribute(&contributor, &50000000i128).unwrap();
    client.contribute(&contributor, &30000000i128).unwrap();

    let campaign = client.get_campaign().unwrap();
    assert_eq!(campaign.total_raised, 80000000i128);
    assert_eq!(campaign.contributor_count, 1u32);

    let contribution = client.get_contribution(&contributor);
    assert_eq!(contribution, 80000000i128);
}

#[test]
fn test_contribute_invalid_amount() {
    let (env, contract_id, beneficiary, contributor) = setup();
    let token_admin = Address::generate(&env);
    let token = env.register_stellar_asset_contract_v2(token_admin.clone());
    let token_addr = token.address();

    let client = CrowdfundContractClient::new(&env, &contract_id);
    client.initialize(&beneficiary, &token_addr, &1000000000i128, &1790035200u64).unwrap();

    let result = client.contribute(&contributor, &0i128);
    assert_eq!(result, Err(Error::InvalidAmount));

    let result = client.contribute(&contributor, &-1i128);
    assert_eq!(result, Err(Error::InvalidAmount));
}

#[test]
fn test_contribute_after_deadline() {
    let (env, contract_id, beneficiary, contributor) = setup();
    let token_admin = Address::generate(&env);
    let token = env.register_stellar_asset_contract_v2(token_admin.clone());
    let token_addr = token.address();

    let client = CrowdfundContractClient::new(&env, &contract_id);
    client.initialize(&beneficiary, &token_addr, &1000000000i128, &2000u64).unwrap();

    let token_client = token::StellarAssetClient::new(&env, &token_addr);
    token_client.mint(&contributor, &100000000i128);

    env.ledger().set_timestamp(3000);

    let result = client.contribute(&contributor, &50000000i128);
    assert_eq!(result, Err(Error::CampaignEnded));
}

#[test]
fn test_contribute_emits_event() {
    let (env, contract_id, beneficiary, contributor) = setup();
    let token_admin = Address::generate(&env);
    let token = env.register_stellar_asset_contract_v2(token_admin.clone());
    let token_addr = token.address();

    let client = CrowdfundContractClient::new(&env, &contract_id);
    client.initialize(&beneficiary, &token_addr, &1000000000i128, &1790035200u64).unwrap();

    let token_client = token::StellarAssetClient::new(&env, &token_addr);
    token_client.mint(&contributor, &100000000i128);

    client.contribute(&contributor, &50000000i128).unwrap();

    let events = env.events().all();
    assert!(events.len() > 0);
}
