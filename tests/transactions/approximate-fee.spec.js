const { test, expect } = require('@playwright/test');
const { generateHeaders, CONFIG } = require('../../auth/auth.js');
const endpoints = require('../../config/endpoints.js');
const payloads = require('../../config/payloads.js');
const testData = require('../../config/test-data.js');

// Fee estimation is non-destructive but needs realistic transfer inputs, so the positive
// case runs only when testData.testnet.{fromAddress,toAddress} are provided.
const hasData = Boolean(testData.testnet.fromAddress && testData.testnet.toAddress);

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

test.describe('Transactions API - POST /vaults/{vaultId}/approximate-fee - positive', () => {

  test('should estimate a fee for a coin transfer', async ({ request }) => {
    test.skip(!hasData, 'Set testData.testnet.{fromAddress,toAddress} to run fee estimation');
    await new Promise(resolve => setTimeout(resolve, 1000));
    const path = endpoints.transactions.approximateFee(testData.vaults.testVaultId);
    const payload = payloads.transactions.approximateFee({
      transactionType: 'coin', // adjust if the API expects another transactionType value
      vaultAccountId,
      assetId: testData.assets.ethereum.assetId,
      fromAddress: testData.testnet.fromAddress,
      toAddress: testData.testnet.toAddress,
      amount: '0.0001',
      feePriority: 'standard',
    });
    const headers = generateHeaders('POST', path, payload);
    const res = await request.post(`${CONFIG.baseUrl}${path}`, { headers, data: payload });
    const body = await res.json();
    expect(res.status()).toBe(200);
    expect(body).toHaveProperty('data');
    expect(body.data).toHaveProperty('item');
  });

});

test.describe('Transactions API - POST /vaults/{vaultId}/approximate-fee - negative tests', () => {

  test('should return 400/409 when required transactionType is missing', async ({ request }) => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    const path = endpoints.transactions.approximateFee(testData.vaults.testVaultId);
    const payload = payloads.transactions.approximateFee({ vaultAccountId }); // no transactionType
    const headers = generateHeaders('POST', path, payload);
    const res = await request.post(`${CONFIG.baseUrl}${path}`, { headers, data: payload });
    expect([400, 409, 422]).toContain(res.status());
  });

  test('should return 403 when vaultId does not belong to the API key', async ({ request }) => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    const path = endpoints.transactions.approximateFee('000000000000000000000000');
    const payload = payloads.transactions.approximateFee({ transactionType: 'coin', vaultAccountId });
    const headers = generateHeaders('POST', path, payload);
    const res = await request.post(`${CONFIG.baseUrl}${path}`, { headers, data: payload });
    expect(res.status()).toBe(403);
  });

  test('should return 401 when signature is invalid', async ({ request }) => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    const path = endpoints.transactions.approximateFee(testData.vaults.testVaultId);
    const payload = payloads.transactions.approximateFee({ transactionType: 'coin', vaultAccountId });
    const headers = generateHeaders('POST', path, payload);
    headers['x-api-sign'] = 'invalid-signature';
    const res = await request.post(`${CONFIG.baseUrl}${path}`, { headers, data: payload });
    const resBody = await res.json();
    expect(res.status()).toBe(401);
    expect(resBody.error.code).toBe('invalid_api_sign');
  });

});
