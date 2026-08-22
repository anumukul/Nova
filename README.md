# Nova

A trustless crowdfunding dApp on Stellar testnet, built with a Soroban smart contract and a multi-wallet frontend.

Nova runs a single on-chain fundraising campaign. Contributors send real testnet XLM to the smart contract, which records each contribution, emits an event, and exposes live campaign state. The frontend reads that state over Soroban RPC and streams contribution events into a real-time activity feed.

## Live Demo

https://frontend-three-alpha-zpmiggmd0g.vercel.app

## Deployed Contract

**Contract ID:** [`CCJ67UMBEM2NYCZM4DCPZN7HMVANZUUZAAAA2XEX7PHQL2UFKKNBQJD7`](https://stellar.expert/explorer/testnet/contract/CCJ67UMBEM2NYCZM4DCPZN7HMVANZUUZAAAA2XEX7PHQL2UFKKNBQJD7)

**Network:** Stellar Testnet

## Transaction Hash

**Contract call (`contribute`):** [`13733d4ab55229e5c3c8908191e0a5816ebce33b5c8d4927be90aeece3aee4b0`](https://stellar.expert/explorer/testnet/tx/13733d4ab55229e5c3c8908191e0a5816ebce33b5c8d4927be90aeece3aee4b0)

A successful contribution that transferred real testnet XLM to the campaign contract via the native asset SAC. The call is verifiable on Stellar Explorer at the link above.

## Screenshots

### Wallet options

![Wallet options modal](docs/screenshots/wallet-options.png)

Multi-wallet selection via StellarWalletsKit — Freighter, Albedo, xBull, LOBSTR, HOT, and more.

### Campaign progress and activity feed

![Campaign progress](docs/screenshots/campaign-progress.png)

Live progress bar, raised/goal totals, contributor count, countdown, and a real-time activity feed of contributions streamed from contract events.

### Successful contribution

![Successful contribution](docs/screenshots/successful-contribution.png)

Transaction status showing success, the transaction hash, and a link to view the call on Stellar Explorer.

## Tech Stack

**Smart contract**
- Rust, Soroban SDK v22
- Build target `wasm32v1-none`
- Deployed with the Stellar CLI

**Frontend**
- Next.js 16 (App Router) + TypeScript
- Tailwind CSS
- `@creit.tech/stellar-wallets-kit` — multi-wallet support
- `@stellar/stellar-sdk` v13 (RPC namespace)
- Deployed on Vercel

## Features

- **Multi-wallet support** — connect via Freighter, Albedo, xBull, LOBSTR, HOT, and others through StellarWalletsKit.
- **Deployed Soroban contract** — real testnet contract that holds campaign state and collects XLM.
- **Real-time activity feed** — contract `contrib` events are polled and streamed into the UI.
- **Live campaign progress** — progress bar, contributor count, and deadline countdown update as contributions arrive.
- **Full transaction status** — preparing to signing to pending to success/failed, with hash and explorer link.
- **Error handling** — wallet not found, user rejected, insufficient balance, wrong network, and campaign-ended cases are surfaced to the user.
- **Responsive dark UI.**

## How It Works

The contract exposes:
- `initialize(beneficiary, token, goal, deadline)` — configures the campaign once after deployment.
- `contribute(contributor, amount)` — transfers XLM from the contributor to the contract, updates totals, and emits a `contrib` event.
- `get_campaign()` — returns full campaign state (read-only).
- `get_contribution(who)` — returns an address's total contribution (read-only).
- `withdraw()` — lets the beneficiary withdraw once the goal is met.

The frontend:
1. Connects a wallet through the StellarWalletsKit modal.
2. Reads campaign state via `simulateTransaction` (no fee).
3. Contributes with the full Soroban flow: build, `prepareTransaction` (simulate), sign, `sendTransaction`, then poll `getTransaction`.
4. Polls `getEvents` for the contract on an interval and updates the feed and progress live.

## Setup & Run Locally

### Prerequisites

- Rust 1.84+ with the `wasm32v1-none` target
- Stellar CLI (latest)
- Node.js 20+
- A Stellar wallet extension (Freighter, xBull, etc.) set to **Testnet**

### Contract

```bash
cd contracts/crowdfund

# add the build target
rustup target add wasm32v1-none

# build
stellar contract build

# create + fund a deployer identity
stellar keys generate deployer --network testnet --fund
stellar keys address deployer            # note this G... address

# deploy — returns the contract ID (starts with C)
stellar contract deploy \
  --wasm target/wasm32v1-none/release/crowdfund.wasm \
  --source-account deployer \
  --network testnet

# resolve the native XLM SAC contract id on testnet
stellar contract id asset --asset native --network testnet

# initialize the campaign once
#   goal 100 XLM = 1000000000 stroops; deadline is a future unix timestamp
stellar contract invoke \
  --id <CONTRACT_ID> \
  --source-account deployer \
  --network testnet \
  -- initialize \
  --beneficiary <deployer G... address> \
  --token <NATIVE_SAC> \
  --goal 1000000000 \
  --deadline 1790035200
```

### Frontend

```bash
cd frontend
npm install

# create your env file and fill in the values
cp .env.example .env.local
```

Set these in `.env.local` (defaults for the public testnet are provided in `.env.example`):

- `NEXT_PUBLIC_CONTRACT_ID` — your deployed contract ID
- `NEXT_PUBLIC_NATIVE_SAC` — native XLM SAC address
- `NEXT_PUBLIC_READ_ACCOUNT` — any funded testnet account (your deployer address works) used as the source for read-only simulations

Then run the dev server:

```bash
npm run dev
```

Open http://localhost:3000, connect a Testnet wallet, and fund it via [Friendbot](https://friendbot.stellar.org) if needed.

## Testing

Contract unit tests:

```bash
cd contracts/crowdfund
cargo test
```

They cover initialization (including duplicate-init prevention), contributions (totals, per-contributor tracking, event emission), invalid amounts, and deadline enforcement.

## Project Structure

```
nova/
├── contracts/
│   └── crowdfund/
│       ├── Cargo.toml
│       └── src/
│           ├── lib.rs          # Soroban contract
│           └── test.rs         # unit tests
├── frontend/
│   ├── app/
│   │   ├── components/         # UI components
│   │   ├── context/            # wallet context
│   │   ├── lib/                # contract, events, errors, kit, balance, constants
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   └── globals.css
│   ├── .env.example
│   └── package.json
├── docs/
│   └── screenshots/
└── README.md
```

## License

MIT