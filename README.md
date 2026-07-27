# Vaultody Public API Tests

Automated API tests for the Vaultody Public REST API using Playwright.

Coverage: all 30 public endpoints bound to API version **`2026-02-28`**, grouped to match
the live docs sections (Vaults · Vault Accounts · Assets & Addresses · Transactions), with
positive and negative cases per endpoint.

## Prerequisites

- Node.js v18+
- VPN access to the QA environment (the `rest.qa-*` edge is on an internal IP)
- `.env` file with valid credentials

## Setup

1. Install dependencies

```
npm install
```

2. Create a `.env` file in the root folder

```
API_KEY=your_api_key
API_PASSPHRASE=your_passphrase
API_SECRET=your_api_secret
BASE_URL=https://rest.qa-01.vaultody.com
```

## Project structure

```
auth/auth.js              # HMAC signing + auth headers
config/endpoints.js       # endpoint paths, grouped by docs section
config/payloads.js        # request-body builders ({ data: { item } } envelope)
config/test-data.js       # vault/asset ids + testnet placeholders
tests/
  vaults/                 # Vaults
  vault-accounts/         # Vault Accounts
  assets-and-addresses/   # Assets & Addresses
  transactions/           # Transactions
```

## Run tests

Run everything:

```
npx playwright test --project=api --reporter=list
```

Run one section or file:

```
npx playwright test vaults/ --project=api
npx playwright test transactions/list-utxos.spec.js --project=api
```

List all tests without running:

```
npx playwright test --list
```

## Destructive transaction tests

Endpoints that create **real** transaction-requests (single/multiple/batch transfer,
contract-interaction, UTXO transfer, gas-sponsorship, Tron resource management) keep their
positive case behind an explicit flag and skip by default. Their negative cases (auth gates,
missing required fields) always run.

To run the positive cases, fill the `testnet` / `tron` values in `config/test-data.js` and set:

```
RUN_DESTRUCTIVE=true npx playwright test transactions/ --project=api
```

## Notes

- Read tests discover ids (vaultAccountId, address, transactionId, …) dynamically via the
  public GET endpoints, so they need no hardcoded fixtures beyond the vault ids in `test-data.js`.
- Public request-body enum values are **lowercase** (`feePriority: slow|standard|fast`,
  `prepareStrategy: minimize_dust|optimize_size`, `method: approve|transfer-from`).
- Most of these endpoints are still `IN_PROGRESS` in the route store, so some positive
  assertions may legitimately fail until the endpoint is finished — that is useful QA signal.
```
