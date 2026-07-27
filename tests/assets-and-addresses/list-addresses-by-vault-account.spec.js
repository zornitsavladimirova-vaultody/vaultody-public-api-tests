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
  const path = endpoints.assetsAndAddresses.listAddresses(testData.vaults.testVaultId, vaultAccountId);
  const headers = generateHeaders('GET', path);
  response = await request.get(`${CONFIG.baseUrl}${path}`, { headers });
  body = await response.json();
});

test.describe('Assets & Addresses API - GET /vaults/{vaultId}/vault-accounts/{vaultAccountId}/list-addresses', () => {

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

  test('each address should have required fields with correct types', async () => {
    for (const addr of body.data.items) {
      expect(typeof addr.address).toBe('string');
      expect(addr.address.length).toBeGreaterThan(0);

      expect(typeof addr.addressId).toBe('string');
      expect(addr.addressId.length).toBeGreaterThan(0);

      expect(typeof addr.blockchain).toBe('string');
      expect(addr.blockchain.length).toBeGreaterThan(0);

      expect(Array.isArray(addr.balances)).toBeTruthy();
    }
  });

  test('each balance should have amount, assetId and assetUnit', async () => {
    for (const addr of body.data.items) {
      for (const balance of addr.balances) {
        expect(typeof balance.amount).toBe('string');
        expect(typeof balance.assetId).toBe('string');
        expect(typeof balance.assetUnit).toBe('string');
      }
    }
  });

});

test.describe('Assets & Addresses API - GET /vaults/{vaultId}/vault-accounts/{vaultAccountId}/list-addresses - pagination', () => {

  test('should return correct number of items when limit is set to 1', async ({ request }) => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    const path = endpoints.assetsAndAddresses.listAddresses(testData.vaults.testVaultId, vaultAccountId);
    const queryParams = { limit: '1' };
    const headers = generateHeaders('GET', path, {}, queryParams);
    const res = await request.get(`${CONFIG.baseUrl}${path}`, { headers, params: queryParams });
    const b = await res.json();
    expect(res.status()).toBe(200);
    expect(b.data.items.length).toBeLessThanOrEqual(1);
  });

});

test.describe('Assets & Addresses API - GET /vaults/{vaultId}/vault-accounts/{vaultAccountId}/list-addresses - negative tests', () => {

  test('should return 404 when vaultAccountId does not exist', async ({ request }) => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    const path = endpoints.assetsAndAddresses.listAddresses(testData.vaults.testVaultId, '000000000000000000000000');
    const res = await request.get(`${CONFIG.baseUrl}${path}`, { headers: generateHeaders('GET', path) });
    expect([404, 409]).toContain(res.status());
  });

  test('should return 403 when vaultId does not belong to the API key', async ({ request }) => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    const path = endpoints.assetsAndAddresses.listAddresses('000000000000000000000000', vaultAccountId);
    const res = await request.get(`${CONFIG.baseUrl}${path}`, { headers: generateHeaders('GET', path) });
    expect(res.status()).toBe(403);
  });

});
