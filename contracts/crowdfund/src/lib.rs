#![no_std]
use soroban_sdk::{
    contract, contractimpl, contracterror, contracttype,
    token, Address, Env, symbol_short,
};

#[contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq, PartialOrd, Ord)]
#[repr(u32)]
pub enum Error {
    AlreadyInitialized = 1,
    NotInitialized     = 2,
    InvalidAmount      = 3,
    CampaignEnded      = 4,
    NotBeneficiary     = 5,
    GoalNotMet         = 6,
    AlreadyWithdrawn   = 7,
}

#[contracttype]
#[derive(Clone)]
pub enum DataKey {
    Beneficiary,
    Token,
    Goal,
    Deadline,
    TotalRaised,
    ContributorCount,
    Contribution(Address),
    Withdrawn,
}

#[contracttype]
#[derive(Clone)]
pub struct CampaignData {
    pub beneficiary: Address,
    pub token: Address,
    pub goal: i128,
    pub deadline: u64,
    pub total_raised: i128,
    pub contributor_count: u32,
    pub withdrawn: bool,
}

#[contract]
pub struct CrowdfundContract;

#[contractimpl]
impl CrowdfundContract {
    pub fn initialize(
        env: Env,
        beneficiary: Address,
        token: Address,
        goal: i128,
        deadline: u64,
    ) -> Result<(), Error> {
        if env.storage().instance().has(&DataKey::Beneficiary) {
            return Err(Error::AlreadyInitialized);
        }
        if goal <= 0 { return Err(Error::InvalidAmount); }
        let s = env.storage().instance();
        s.set(&DataKey::Beneficiary, &beneficiary);
        s.set(&DataKey::Token, &token);
        s.set(&DataKey::Goal, &goal);
        s.set(&DataKey::Deadline, &deadline);
        s.set(&DataKey::TotalRaised, &0i128);
        s.set(&DataKey::ContributorCount, &0u32);
        s.set(&DataKey::Withdrawn, &false);
        Ok(())
    }
}

mod test;
