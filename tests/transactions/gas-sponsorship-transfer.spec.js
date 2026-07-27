const { test, expect } = require('@playwright/test');
const { generateHeaders, CONFIG } = require('../../auth/auth.js');
const endpoints = require('../../config/endpoints.js');
const payloads = require('../../config/payloads.js');
const testData = require('../../config/test-data.js');

// DESTRUCTIVE: creates a real gas-sponsorship transaction-request.
const RUN_DESTRUCTIVE = process.env.RUN_DESTRUCTIVE === 'true';
const hasData = Boolean(testData.testnet.fromAddress && testData.testnet.toAddress && testData.testnet.feePayerAddress);
const canRunPositive = RUN_DESTRUCTIVE && hasData;

let vaultAccountId;

async function discoverVaultAccountId(request) {
  const listPath = endpoints.vaultAccounts.list(testData.vaults.testVaultId);
  const res = await request.get(`${CONFIG.baseUrl}${listPath}`, { headers: generateHeaders('GET', listPath) });
  return (await res.json()).data.items[0].vaultAccountId;
}

test.beforeAll(async ({ request }) => {
  await new Promise(resolve => setTimeout(resolve, 1000));
  vaultAccountId = await discoverVaultAccountId(request);
});

test.describe('Transactions API - POST /vaults/{vaultId}/transaction-requests/gas-sponsorship-transfer - positive', () => {

  test('should create a gas-sponsorship transaction request', async ({ request }) => {
    test.skip(!canRunPositive, 'Set RUN_DESTRUCTIVE=true and testData.testnet.{fromAddress,toAddress,feePayerAddress}');
    await new Promise(resolve => setTimeout(resolve, 1000));
    const path = endpoints.transactions.gasSponsorship(testData.vaults.testVaultId);
    const payload = payloads.transactions.gasSponsorship({
      amount: '0.0001',
      assetId: testData.assets.ethereumTokenUsdc.assetId,
      feePayer: testData.testnet.feePayerAddress,
      fromAddress: testData.testnet.fromAddress,
      toAddress: testData.testnet.toAddress,
      note: 'pw-gas-sponsorship',
      vaultAccountId,
    });
    const headers = generateHeaders('POST', path, payload);
    const res = await request.post(`${CONFIG.baseUrl}${path}`, { headers, data: payload });
    const body = await res.json();
    expect([200, 201]).toContain(res.status());
    const id = body.data.item.transactionRequestId || body.data.item.id;
    expect(typeof id).toBe('string');
    expect(id.length).toBeGreaterThan(0);
  });

});

test.describe('Transactions API - POST .../gas-sponsorship-transfer - negative tests', () => {

  test('should return 400/409 when required fields are missing', async ({ request }) => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    const path = endpoints.transactions.gasSponsorship(testData.vaults.testVaultId);
    const payload = payloads.transactions.gasSponsorship({ vaultAccountId }); // missing required fields
    const headers = generateHeaders('POST', path, payload);
    const res = await request.post(`${CONFIG.baseUrl}${path}`, { headers, data: payload });
    expect([400, 409, 422]).toContain(res.status());
  });

  test('should return 403 when vaultId does not belong to the API key', async ({ request }) => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    const path = endpoints.transactions.gasSponsorship('000000000000000000000000');
    const payload = payloads.transactions.gasSponsorship({
      amount: '0.0001', assetId: testData.assets.ethereumTokenUsdc.assetId, feePayer: 'f', fromAddress: 'x', toAddress: 'y', note: 'n', vaultAccountId,
    });
    const headers = generateHeaders('POST', path, payload);
    const res = await request.post(`${CONFIG.baseUrl}${path}`, { headers, data: payload });
    expect(res.status()).toBe(403);
  });

  test('should return 401 when signature is invalid', async ({ request }) => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    const path = endpoints.transactions.gasSponsorship(testData.vaults.testVaultId);
    const payload = payloads.transactions.gasSponsorship({
      amount: '0.0001', assetId: testData.assets.ethereumTokenUsdc.assetId, feePayer: 'f', fromAddress: 'x', toAddress: 'y', note: 'n', vaultAccountId,
    });
    const headers = generateHeaders('POST', path, payload);
    headers['x-api-sign'] = 'invalid-signature';
    const res = await request.post(`${CONFIG.baseUrl}${path}`, { headers, data: payload });
    const resBody = await res.json();
    expect(res.status()).toBe(401);
    expect(resBody.error.code).toBe('invalid_api_sign');
  });

});
