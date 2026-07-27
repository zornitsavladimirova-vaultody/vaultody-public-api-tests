const { test, expect } = require('@playwright/test');
const { generateHeaders, CONFIG } = require('../../auth/auth.js');
const endpoints = require('../../config/endpoints.js');
const testData = require('../../config/test-data.js');

let response;
let body;

test.beforeAll(async ({ request }) => {
  await new Promise(resolve => setTimeout(resolve, 1000));
  const path = endpoints.assetsAndAddresses.encodeXrpAddress(
    testData.xrp.network,
    testData.xrp.classicAddress,
    testData.xrp.addressTag
  );
  const headers = generateHeaders('GET', path);
  response = await request.get(`${CONFIG.baseUrl}${path}`, { headers });
  body = await response.json();
});

test.describe('Assets & Addresses API - GET /utils/xrp/{network}/addresses/encode/{classicAddress}/{addressTag}', () => {

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

  test('response should contain data field with item', async () => {
    expect(body).toHaveProperty('data');
    expect(body.data).toHaveProperty('item');
  });

  test('item should contain xAddress as a non-empty string starting with X', async () => {
    expect(typeof body.data.item.xAddress).toBe('string');
    expect(body.data.item.xAddress.length).toBeGreaterThan(0);
    expect(body.data.item.xAddress.startsWith('X') || body.data.item.xAddress.startsWith('T')).toBeTruthy();
  });

});

test.describe('Assets & Addresses API - GET .../encode/{classicAddress}/{addressTag} - negative tests', () => {

  test('should return an error for a malformed classic address', async ({ request }) => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    const path = endpoints.assetsAndAddresses.encodeXrpAddress(testData.xrp.network, 'not-a-classic-address', testData.xrp.addressTag);
    const res = await request.get(`${CONFIG.baseUrl}${path}`, { headers: generateHeaders('GET', path) });
    expect([400, 409, 422]).toContain(res.status());
  });

  test('should return 401 when signature is invalid', async ({ request }) => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    const path = endpoints.assetsAndAddresses.encodeXrpAddress(testData.xrp.network, testData.xrp.classicAddress, testData.xrp.addressTag);
    const headers = generateHeaders('GET', path);
    headers['x-api-sign'] = 'invalid-signature';
    const res = await request.get(`${CONFIG.baseUrl}${path}`, { headers });
    const resBody = await res.json();
    expect(res.status()).toBe(401);
    expect(resBody.error.code).toBe('invalid_api_sign');
  });

});
