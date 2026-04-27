# Vaultody Public API Tests

Automated API tests for the Vaultody Public REST API using Playwright.

## Prerequisites

- Node.js v18+
- VPN access to QA environment
- `.env` file with valid credentials

## Setup

1. Clone the repository

git clone https://github.com/zornitsavladimirova-vaultody/vaultody-public-api-tests.git
cd vaultody-public-api-tests

2. Install dependencies

npm install

3. Create `.env` file in the root folder

API_KEY=your_api_key
API_PASSPHRASE=your_passphrase
API_SECRET=your_api_secret
BASE_URL=https://rest.qa-01.vaultody.com

## Run Tests

Run all tests:
npx playwright test --project=api --reporter=list

Run specific group:
npx playwright test vaults/ --project=api --reporter=list

Run specific file:
npx playwright test vaults/list-vaults.spec.js --project=api --reporter=list