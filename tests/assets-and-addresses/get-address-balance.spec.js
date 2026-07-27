const { test, expect } = require('@playwright/test');
const { generateHeaders, CONFIG } = require('../../auth/auth.js');
const endpoints = require('../../config/endpoints.js');
const testData = require('../../config/test-data.js');

let response;
let body;
let address;

async function discoverAddress(request) {
  const listVaPath = endpoints.vaultAccounts.list(testData.vaults.testVaultId);
  const vaRes = await request.get(`${CONFIG.baseUrl}${listVaPath}`, { headers: generateHeaders('GET', listVaPath) });
  const vaultAccountId = (await vaRes.json()).data.items[0].vaultAccountId;

  await new Promise(resolve => setTimeout(resolve, 1000));
  const listAddrPath = endpoints.assetsAndAddresses.listAddresses(testData.vaults.testVaultId, vaultAccountId);
  const addrRes = await request.get(`${CONFIG.baseUrl}${listAddrPath}`, { headers: generateHeaders('GET', listAddrPath) });
  const items = (await addrRes.json()).data.items;
  return items.length > 0 ? items[0].address : null;
}

test.beforeAll(async ({ request }) => {
  await new Promise(resolve => setTimeout(resolve, 1000));
  address = await discoverAddress(request);
  if (!address) return;

  await new Promise(resolve => setTimeout(resolve, 1000));
  const path = endpoints.assetsAndAddresses.getAddressBalance(testData.vaults.testVaultId, address);
  const headers = generateHeaders('GET', path);
  response = await request.get(`${CONFIG.baseUrl}${path}`, { headers });
  body = await response.json();
});

test.describe('Assets & Addresses API - GET /vaults/{vaultId}/addresses/{address}/balance', () => {

  test('should return status 200', async () => {
    test.skip(!address, 'No address found in the test vault to query balance for');
    expect(response.status()).toBe(200);
  });

  test('response should contain apiVersion as non-empty string', async () => {
    test.skip(!address, 'No address found in the test vault to query balance for');
    expect(typeof body.apiVersion).toBe('string');
    expect(body.apiVersion.length).toBeGreaterThan(0);
  });

  test('response should contain requestId as non-empty string', async () => {
    test.skip(!address, 'No address found in the test vault to query balance for');
    expect(typeof body.requestId).toBe('string');
    expect(body.requestId.length).toBeGreaterThan(0);
  });

  test('response should contain data field', async () => {
    test.skip(!address, 'No address found in the test vault to query balance for');
    expect(body).toHaveProperty('data');
  });

  test('data should expose assets with correct types', async () => {
    test.skip(!address, 'No address found in the test vault to query balance for');
    const assets = body.data.item ? body.data.item.assets : body.data.items;
    expect(Array.isArray(assets)).toBeTruthy();
    for (const asset of assets) {
      expect(typeof asset.assetId).toBe('string');
      expect(asset.assetId.length).toBeGreaterThan(0);
      expect(typeof asset.assetUnit).toBe('string');
    }
  });

});

test.describe('Assets & Addresses API - GET /vaults/{vaultId}/addresses/{address}/balance - negative tests', () => {

  test('should return 403 when vaultId does not belong to the API key', async ({ request }) => {
    test.skip(!address, 'No address found in the test vault to query balance for');
    await new Promise(resolve => setTimeout(resolve, 1000));
    const path = endpoints.assetsAndAddresses.getAddressBalance('000000000000000000000000', address);
    const res = await request.get(`${CONFIG.baseUrl}${path}`, { headers: generateHeaders('GET', path) });
    expect(res.status()).toBe(403);
  });

  test('should return 401 when signature is invalid', async ({ request }) => {
    test.skip(!address, 'No address found in the test vault to query balance for');
    await new Promise(resolve => setTimeout(resolve, 1000));
    const path = endpoints.assetsAndAddresses.getAddressBalance(testData.vaults.testVaultId, address);
    const headers = generateHeaders('GET', path);
    headers['x-api-sign'] = 'invalid-signature';
    const res = await request.get(`${CONFIG.baseUrl}${path}`, { headers });
    const resBody = await res.json();
    expect(res.status()).toBe(401);
    expect(resBody.error.code).toBe('invalid_api_sign');
  });

});
