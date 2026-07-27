const { test, expect } = require('@playwright/test');
const { generateHeaders, CONFIG } = require('../../auth/auth.js');
const endpoints = require('../../config/endpoints.js');

let response;
let body;

test.beforeAll(async ({ request }) => {
  await new Promise(resolve => setTimeout(resolve, 1000));
  const path = endpoints.assetsAndAddresses.listSupported;
  const headers = generateHeaders('GET', path);
  response = await request.get(`${CONFIG.baseUrl}${path}`, { headers });
  body = await response.json();
});

test.describe('Assets & Addresses API - GET /supported-assets', () => {

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

  test('data should contain items as non-empty array', async () => {
    expect(body.data).toHaveProperty('items');
    expect(Array.isArray(body.data.items)).toBeTruthy();
    expect(body.data.items.length).toBeGreaterThan(0);
  });

  test('each supported asset should have required fields with correct types', async () => {
    for (const asset of body.data.items) {
      expect(typeof asset.assetId).toBe('string');
      expect(asset.assetId.length).toBeGreaterThan(0);

      expect(typeof asset.assetUnit).toBe('string');
      expect(asset.assetUnit.length).toBeGreaterThan(0);

      expect(typeof asset.blockchain).toBe('string');
      expect(asset.blockchain.length).toBeGreaterThan(0);

      expect(typeof asset.network).toBe('string');
      expect(asset.network.length).toBeGreaterThan(0);
    }
  });

  // BUG: the public field is spelled "aassetName" (double-a) in the route mapping
  // instead of "assetName". Documenting the current behaviour so a fix flips this test.
  test('each supported asset exposes the (misspelled) aassetName field', async () => {
    for (const asset of body.data.items) {
      expect(asset).toHaveProperty('aassetName');
    }
  });

  test('each supported asset should have a price object with amount and unit', async () => {
    for (const asset of body.data.items) {
      if (asset.price) {
        expect(typeof asset.price.amount).toBe('string');
        expect(typeof asset.price.unit).toBe('string');
      }
    }
  });

});

test.describe('Assets & Addresses API - GET /supported-assets - negative tests', () => {

  test('should return 401 when signature is invalid', async ({ request }) => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    const path = endpoints.assetsAndAddresses.listSupported;
    const headers = generateHeaders('GET', path);
    headers['x-api-sign'] = 'invalid-signature';
    const res = await request.get(`${CONFIG.baseUrl}${path}`, { headers });
    const resBody = await res.json();
    expect(res.status()).toBe(401);
    expect(resBody.error.code).toBe('invalid_api_sign');
  });

  test('should return 401 when authorization headers are missing', async ({ request }) => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    const path = endpoints.assetsAndAddresses.listSupported;
    const res = await request.get(`${CONFIG.baseUrl}${path}`, { headers: {} });
    expect(res.status()).toBe(401);
  });

});
