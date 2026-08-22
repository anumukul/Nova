.PHONY: build deploy init test

build:
	stellar contract build

test:
	cargo test

deploy:
	stellar contract deploy \
		--wasm target/wasm32v1-none/release/crowdfund.wasm \
		--source-account deployer \
		--network testnet

init:
	@echo "Run: stellar contract invoke --id <CONTRACT_ID> --source-account deployer --network testnet -- initialize --beneficiary <ADDRESS> --token <NATIVE_SAC> --goal 1000000000 --deadline 1790035200"
