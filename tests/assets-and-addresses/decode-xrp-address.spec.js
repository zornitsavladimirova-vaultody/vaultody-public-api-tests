const { test, expect } = require('@playwright/test');
const { generateHeaders, CONFIG } = require('../../auth/auth.js');
const endpoints = require('../../config/endpoints.js');
const testData = require('../../config/test-data.js');

let response;
let body;
let xAddress;

// Chain off the encode endpoint so we always decode a known-good x-address
// and can assert the round-trip returns the original classic address + tag.
async function encodeXAddress(request) {
  const path = endpoints.assetsAndAddresses.encodeXrpAddress(
    testData.xrp.network,
    testData.xrp.classicAddress,
    testData.xrp.addressTag
  );
  const res = await request.get(`${CONFIG.baseUrl}${path}`, { headers: generateHeaders('GET', path) });
  return (await res.json()).data.item.xAddress;
}

test.beforeAll(async ({ request }) => {
  await new Promise(resolve => setTimeout(resolve, 1000));
  xAddress = await encodeXAddress(request);

  await new Promise(resolve => setTimeout(resolve, 1000));
  const path = endpoints.assetsAndAddresses.decodeXrpAddress(testData.xrp.network, xAddress);
  const headers = generateHeaders('GET', path);
  response = await request.get(`${CONFIG.baseUrl}${path}`, { headers });
  body = await response.json();
});

test.describe('Assets & Addresses API - GET /utils/xrp/{network}/addresses/decode/{xAddress}', () => {

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

  test('decoded classicAddress should match the original', async () => {
    expect(body.data.item.classicAddress).toBe(testData.xrp.classicAddress);
  });

  test('decoded tag should match the original addressTag', async () => {
    expect(String(body.data.item.tag)).toBe(String(testData.xrp.addressTag));
  });

});

test.describe('Assets & Addresses API - GET .../decode/{xAddress} - negative tests', () => {

  test('should return an error for a malformed x-address', async ({ request }) => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    const path = endpoints.assetsAndAddresses.decodeXrpAddress(testData.xrp.network, 'not-an-x-address');
    const res = await request.get(`${CONFIG.baseUrl}${path}`, { headers: generateHeaders('GET', path) });
    expect([400, 409, 422]).toContain(res.status());
  });

  test('should return 401 when signature is invalid', async ({ request }) => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    const path = endpoints.assetsAndAddresses.decodeXrpAddress(testData.xrp.network, xAddress);
    const headers = generateHeaders('GET', path);
    headers['x-api-sign'] = 'invalid-signature';
    const res = await request.get(`${CONFIG.baseUrl}${path}`, { headers });
    const resBody = await res.json();
    expect(res.status()).toBe(401);
    expect(resBody.error.code).toBe('invalid_api_sign');
  });

});
