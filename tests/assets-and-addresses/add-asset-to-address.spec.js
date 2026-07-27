const { test, expect } = require('@playwright/test');
const { generateHeaders, CONFIG } = require('../../auth/auth.js');
const endpoints = require('../../config/endpoints.js');
const payloads = require('../../config/payloads.js');
const testData = require('../../config/test-data.js');

let response;
let body;
let vaultAccountId;
const assetId = testData.assets.ethereumTokenUsdc.assetId;

async function discoverVaultAccountId(request) {
  const listPath = endpoints.vaultAccounts.list(testData.vaults.testVaultId);
  const res = await request.get(`${CONFIG.baseUrl}${listPath}`, { headers: generateHeaders('GET', listPath) });
  return (await res.json()).data.items[0].vaultAccountId;
}

test.beforeAll(async ({ request }) => {
  await new Promise(resolve => setTimeout(resolve, 1000));
  vaultAccountId = await discoverVaultAccountId(request);

  await new Promise(resolve => setTimeout(resolve, 1000));
  const path = endpoints.assetsAndAddresses.addAsset(testData.vaults.testVaultId, vaultAccountId);
  const payload = payloads.assetsAndAddresses.addAsset({ assetId });
  const headers = generateHeaders('PUT', path, payload);
  response = await request.fetch(`${CONFIG.baseUrl}${path}`, { method: 'PUT', headers, data: payload });
  body = await response.json();
});

test.describe('Assets & Addresses API - PUT /vaults/{vaultId}/vault-accounts/{vaultAccountId}/add-asset', () => {

  // 200/201 on first add; 409 if the asset is already present on the account.
  test('should return a success or already-exists status', async () => {
    expect([200, 201, 409]).toContain(response.status());
  });

  test('response should contain apiVersion and requestId', async () => {
    expect(typeof body.apiVersion).toBe('string');
    expect(typeof body.requestId).toBe('string');
  });

  test('response should contain data field', async () => {
    if (response.status() < 300) {
      expect(body).toHaveProperty('data');
    } else {
      expect(body).toHaveProperty('error');
    }
  });

});

test.describe('Assets & Addresses API - PUT .../add-asset - negative tests', () => {

  test('should return 409 when required assetId is missing', async ({ request }) => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    const path = endpoints.assetsAndAddresses.addAsset(testData.vaults.testVaultId, vaultAccountId);
    const payload = payloads.assetsAndAddresses.addAsset({});
    const headers = generateHeaders('PUT', path, payload);
    const res = await request.fetch(`${CONFIG.baseUrl}${path}`, { method: 'PUT', headers, data: payload });
    expect([400, 409]).toContain(res.status());
  });

  test('should return 403 when vaultId does not belong to the API key', async ({ request }) => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    const path = endpoints.assetsAndAddresses.addAsset('000000000000000000000000', vaultAccountId);
    const payload = payloads.assetsAndAddresses.addAsset({ assetId });
    const headers = generateHeaders('PUT', path, payload);
    const res = await request.fetch(`${CONFIG.baseUrl}${path}`, { method: 'PUT', headers, data: payload });
    expect(res.status()).toBe(403);
  });

  test('should return 401 when signature is invalid', async ({ request }) => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    const path = endpoints.assetsAndAddresses.addAsset(testData.vaults.testVaultId, vaultAccountId);
    const payload = payloads.assetsAndAddresses.addAsset({ assetId });
    const headers = generateHeaders('PUT', path, payload);
    headers['x-api-sign'] = 'invalid-signature';
    const res = await request.fetch(`${CONFIG.baseUrl}${path}`, { method: 'PUT', headers, data: payload });
    const resBody = await res.json();
    expect(res.status()).toBe(401);
    expect(resBody.error.code).toBe('invalid_api_sign');
  });

});
