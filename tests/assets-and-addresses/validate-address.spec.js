const { test, expect } = require('@playwright/test');
const { generateHeaders, CONFIG } = require('../../auth/auth.js');
const endpoints = require('../../config/endpoints.js');
const payloads = require('../../config/payloads.js');

// A well-known, correctly checksummed Ethereum address (format-valid on any EVM network).
const VALID_ETH_ADDRESS = '0x742d35Cc6634C0532925a3b844Bc454e4438f44e';
const BLOCKCHAIN = 'ethereum';
const NETWORK = 'sepolia';

let response;
let body;

test.beforeAll(async ({ request }) => {
  await new Promise(resolve => setTimeout(resolve, 1000));
  const path = endpoints.assetsAndAddresses.validateAddress(BLOCKCHAIN, NETWORK);
  const payload = payloads.assetsAndAddresses.validateAddress(VALID_ETH_ADDRESS);
  const headers = generateHeaders('POST', path, payload);
  response = await request.post(`${CONFIG.baseUrl}${path}`, { headers, data: payload });
  body = await response.json();
});

test.describe('Assets & Addresses API - POST /info/{blockchain}/{network}/addresses/validate', () => {

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

  test('a valid address should be reported as valid', async () => {
    expect(body.data.item.isValid).toBe(true);
  });

});

test.describe('Assets & Addresses API - POST /info/{blockchain}/{network}/addresses/validate - negative tests', () => {

  test('a malformed address should be reported as invalid', async ({ request }) => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    const path = endpoints.assetsAndAddresses.validateAddress(BLOCKCHAIN, NETWORK);
    const payload = payloads.assetsAndAddresses.validateAddress('not-a-real-address');
    const headers = generateHeaders('POST', path, payload);
    const res = await request.post(`${CONFIG.baseUrl}${path}`, { headers, data: payload });
    const resBody = await res.json();
    // Either a 200 with isValid=false, or a validation error.
    if (res.status() === 200) {
      expect(resBody.data.item.isValid).toBe(false);
    } else {
      expect([400, 422]).toContain(res.status());
    }
  });

  test('should return 409 for an unknown blockchain', async ({ request }) => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    const path = endpoints.assetsAndAddresses.validateAddress('not-a-chain', NETWORK);
    const payload = payloads.assetsAndAddresses.validateAddress(VALID_ETH_ADDRESS);
    const headers = generateHeaders('POST', path, payload);
    const res = await request.post(`${CONFIG.baseUrl}${path}`, { headers, data: payload });
    expect([400, 409]).toContain(res.status());
  });

  test('should return 415 when Content-Type is missing', async ({ request }) => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    const path = endpoints.assetsAndAddresses.validateAddress(BLOCKCHAIN, NETWORK);
    const payload = payloads.assetsAndAddresses.validateAddress(VALID_ETH_ADDRESS);
    const headers = generateHeaders('POST', path, payload);
    delete headers['Content-Type'];
    const res = await request.post(`${CONFIG.baseUrl}${path}`, { headers, data: payload });
    expect(res.status()).toBe(415);
  });

});
