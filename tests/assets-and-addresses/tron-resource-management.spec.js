const { test, expect } = require('@playwright/test');
const { generateHeaders, CONFIG } = require('../../auth/auth.js');
const endpoints = require('../../config/endpoints.js');
const payloads = require('../../config/payloads.js');
const testData = require('../../config/test-data.js');

// DESTRUCTIVE: creates a real Tron resource transaction-request.
// Positive case runs only with RUN_DESTRUCTIVE=true and real testData.tron.{vaultId,fromAddress}.
const RUN_DESTRUCTIVE = process.env.RUN_DESTRUCTIVE === 'true';
const hasTronData = Boolean(testData.tron.vaultId && testData.tron.fromAddress);
const canRunPositive = RUN_DESTRUCTIVE && hasTronData;

test.describe('Assets & Addresses API - POST /vaults/{vaultId}/{blockchain}/{network}/addresses/{fromAddress}/manage-resource - positive', () => {

  test('should create a FREEZE bandwidth resource request', async ({ request }) => {
    test.skip(!canRunPositive, 'Set RUN_DESTRUCTIVE=true and testData.tron.{vaultId,fromAddress} to run');
    await new Promise(resolve => setTimeout(resolve, 1000));
    const path = endpoints.assetsAndAddresses.tronResourceManagement(
      testData.tron.vaultId, testData.tron.blockchain, testData.tron.network, testData.tron.fromAddress
    );
    const payload = payloads.assetsAndAddresses.tronResourceManagement({
      resource: 'bandwidth',
      type: 'freeze',
      amount: '1',
      note: 'pw-tron-freeze',
    });
    const headers = generateHeaders('POST', path, payload);
    const res = await request.post(`${CONFIG.baseUrl}${path}`, { headers, data: payload });
    const body = await res.json();
    expect([200, 201]).toContain(res.status());
    expect(typeof body.data.item.id).toBe('string');
    expect(body.data.item.id.length).toBeGreaterThan(0);
  });

});

test.describe('Assets & Addresses API - POST .../manage-resource - negative tests', () => {

  test('should return 401 when signature is invalid', async ({ request }) => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    const path = endpoints.assetsAndAddresses.tronResourceManagement(
      testData.vaults.testVaultId, 'tron', testData.tron.network, 'TXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX'
    );
    const payload = payloads.assetsAndAddresses.tronResourceManagement({ resource: 'bandwidth', type: 'freeze', amount: '1' });
    const headers = generateHeaders('POST', path, payload);
    headers['x-api-sign'] = 'invalid-signature';
    const res = await request.post(`${CONFIG.baseUrl}${path}`, { headers, data: payload });
    const body = await res.json();
    expect(res.status()).toBe(401);
    expect(body.error.code).toBe('invalid_api_sign');
  });

  test('should return 403 when vaultId does not belong to the API key', async ({ request }) => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    const path = endpoints.assetsAndAddresses.tronResourceManagement(
      '000000000000000000000000', 'tron', testData.tron.network, 'TXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX'
    );
    const payload = payloads.assetsAndAddresses.tronResourceManagement({ resource: 'bandwidth', type: 'freeze', amount: '1' });
    const headers = generateHeaders('POST', path, payload);
    const res = await request.post(`${CONFIG.baseUrl}${path}`, { headers, data: payload });
    expect(res.status()).toBe(403);
  });

  test('should return 409/400 when required fields are missing', async ({ request }) => {
    test.skip(!hasTronData, 'testData.tron.{vaultId,fromAddress} not set (needed to pass auth before body validation)');
    await new Promise(resolve => setTimeout(resolve, 1000));
    const path = endpoints.assetsAndAddresses.tronResourceManagement(
      testData.tron.vaultId, testData.tron.blockchain, testData.tron.network, testData.tron.fromAddress
    );
    const payload = payloads.assetsAndAddresses.tronResourceManagement({}); // no resource / type
    const headers = generateHeaders('POST', path, payload);
    const res = await request.post(`${CONFIG.baseUrl}${path}`, { headers, data: payload });
    expect([400, 409]).toContain(res.status());
  });

});
