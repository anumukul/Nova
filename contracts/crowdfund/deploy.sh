#!/bin/bash
set -e

echo "=== Nova Contract Deploy Script ==="

echo "1. Building contract..."
stellar contract build

echo "2. Generating deployer key (if not exists)..."
stellar keys generate nova-deployer --network testnet --fund 2>/dev/null || echo "Key already exists"

DEPLOYER=$(stellar keys address nova-deployer)
echo "Deployer address: $DEPLOYER"

echo "3. Deploying contract..."
CONTRACT_ID=$(stellar contract deploy \
  --wasm target/wasm32v1-none/release/crowdfund.wasm \
  --source-account nova-deployer \
  --network testnet)
echo "Contract ID: $CONTRACT_ID"

echo "4. Getting native XLM SAC address..."
NATIVE_SAC=$(stellar contract id asset --asset native --network testnet)
echo "Native SAC: $NATIVE_SAC"

echo "5. Initializing campaign..."
stellar contract invoke \
  --id "$CONTRACT_ID" \
  --source-account nova-deployer \
  --network testnet \
  -- initialize \
  --beneficiary "$DEPLOYER" \
  --token "$NATIVE_SAC" \
  --goal 1000000000 \
  --deadline 1790035200

echo ""
echo "=== Deployment Complete ==="
echo "CONTRACT_ID=$CONTRACT_ID"
echo "NATIVE_SAC=$NATIVE_SAC"
echo "READ_ACCOUNT=$DEPLOYER"
echo ""
echo "Add these to frontend/.env"
