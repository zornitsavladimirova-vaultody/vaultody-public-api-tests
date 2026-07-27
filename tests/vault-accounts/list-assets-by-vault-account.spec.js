const { test, expect } = require('@playwright/test');
const { generateHeaders, CONFIG } = require('../../auth/auth.js');
const endpoints = require('../../config/endpoints.js');
const testData = require('../../config/test-data.js');

let response;
let body;
let vaultAccountId;

async function discoverVaultAccountId(request) {
  const listPath = endpoints.vaultAccounts.list(testData.vaults.testVaultId);
  const res = await request.get(`${CONFIG.baseUrl}${listPath}`, { headers: generateHeaders('GET', listPath) });
  const listBody = await res.json();
  return listBody.data.items[0].vaultAccountId;
}

test.beforeAll(async ({ request }) => {
  await new Promise(resolve => setTimeout(resolve, 1000));
  vaultAccountId = await discoverVaultAccountId(request);

  await new Promise(resolve => setTimeout(resolve, 1000));
  const path = endpoints.vaultAccounts.listAssets(testData.vaults.testVaultId, vaultAccountId);
  const headers = generateHeaders('GET', path);
  response = await request.get(`${CONFIG.baseUrl}${path}`, { headers });
  body = await response.json();
});

test.describe('Vault Accounts API - GET /vaults/{vaultId}/vault-accounts/{vaultAccountId}/list-assets', () => {

  test('should return status 200', async () => {
    expect(response.status()).toBe(200);
  });

  test('response should contain apiVersion as non-empty string', async () => {
    expect(typeof body.apiVersion).toBe('string');
    expect(body.apiVersion.length).toBeGreaterThan(0);
  });

  test('response should contain requestId as non-empty string', async () => {
    expect(typeof body.requestId).toBe('string');
    expect(body.requestId.length).toBeGreaterThan(0);
  });

  test('response should contain data field', async () => {
    expect(body).toHaveProperty('data');
  });

  test('data should contain items as array', async () => {
    expect(body.data).toHaveProperty('items');
    expect(Array.isArray(body.data.items)).toBeTruthy();
  });

  // This route does NOT share the schema of GET /vaults/{vaultId}/assets. It returns a flat item
  // with no `network`, no `type` and no nested `assetData`, and the rate field is named
  // `exchangeRateToUsd` (not `exchangeRateUnit`). Don't copy assertions between the two.
  test('each asset should have required fields with correct types', async () => {
    for (const asset of body.data.items) {
      expect(typeof asset.assetId).toBe('string');
      expect(asset.assetId.length).toBeGreaterThan(0);

      expect(typeof asset.assetUnit).toBe('string');
      expect(asset.assetUnit.length).toBeGreaterThan(0);

      expect(typeof asset.blockchain).toBe('string');
      expect(asset.blockchain.length).toBeGreaterThan(0);

      expect(typeof asset.availableAmount).toBe('string');
      expect(isNaN(parseFloat(asset.availableAmount))).toBeFalsy();

      expect(typeof asset.exchangeRateToUsd).toBe('string');
      expect(isNaN(parseFloat(asset.exchangeRateToUsd))).toBeFalsy();
    }
  });

});

test.describe('Vault Accounts API - GET /vaults/{vaultId}/vault-accounts/{vaultAccountId}/list-assets - negative tests', () => {

  test('should return 404 when vaultAccountId does not exist', async ({ request }) => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    const path = endpoints.vaultAccounts.listAssets(testData.vaults.testVaultId, '000000000000000000000000');
    const res = await request.get(`${CONFIG.baseUrl}${path}`, { headers: generateHeaders('GET', path) });
    expect([404, 409]).toContain(res.status());
  });

  test('should return 403 when vaultId does not belong to the API key', async ({ request }) => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    const path = endpoints.vaultAccounts.listAssets('000000000000000000000000', vaultAccountId);
    const res = await request.get(`${CONFIG.baseUrl}${path}`, { headers: generateHeaders('GET', path) });
    expect(res.status()).toBe(403);
  });

  test('should return 401 when signature is invalid', async ({ request }) => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    const path = endpoints.vaultAccounts.listAssets(testData.vaults.testVaultId, vaultAccountId);
    const headers = generateHeaders('GET', path);
    headers['x-api-sign'] = 'invalid-signature';
    const res = await request.get(`${CONFIG.baseUrl}${path}`, { headers });
    const resBody = await res.json();
    expect(res.status()).toBe(401);
    expect(resBody.error.code).toBe('invalid_api_sign');
  });

});
