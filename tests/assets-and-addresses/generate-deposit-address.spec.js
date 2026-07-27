const { test, expect } = require('@playwright/test');
const { generateHeaders, CONFIG } = require('../../auth/auth.js');
const endpoints = require('../../config/endpoints.js');
const payloads = require('../../config/payloads.js');
const testData = require('../../config/test-data.js');

// Derives a new deposit address inside the vault (no on-chain transaction, safe to run).
const BLOCKCHAIN = 'ethereum';
const NETWORK = 'sepolia';

let response;
let body;
let vaultAccountId;
const label = `pw-deposit-${Date.now()}`;

async function discoverVaultAccountId(request) {
  const listPath = endpoints.vaultAccounts.list(testData.vaults.testVaultId);
  const res = await request.get(`${CONFIG.baseUrl}${listPath}`, { headers: generateHeaders('GET', listPath) });
  return (await res.json()).data.items[0].vaultAccountId;
}

test.beforeAll(async ({ request }) => {
  await new Promise(resolve => setTimeout(resolve, 1000));
  vaultAccountId = await discoverVaultAccountId(request);

  await new Promise(resolve => setTimeout(resolve, 1000));
  const path = endpoints.assetsAndAddresses.generateDepositAddress(testData.vaults.testVaultId, BLOCKCHAIN, NETWORK);
  const payload = payloads.assetsAndAddresses.generateDepositAddress({ label, vaultAccountId });
  const headers = generateHeaders('POST', path, payload);
  response = await request.post(`${CONFIG.baseUrl}${path}`, { headers, data: payload });
  body = await response.json();
});

test.describe('Assets & Addresses API - POST /vaults/{vaultId}/{blockchain}/{network}/addresses', () => {

  test('should return status 200 or 201', async () => {
    expect([200, 201]).toContain(response.status());
  });

  test('response should contain apiVersion and requestId', async () => {
    expect(typeof body.apiVersion).toBe('string');
    expect(typeof body.requestId).toBe('string');
  });

  test('response should contain data field with item', async () => {
    expect(body).toHaveProperty('data');
    expect(body.data).toHaveProperty('item');
  });

  test('item should contain a generated address as a non-empty string', async () => {
    expect(typeof body.data.item.address).toBe('string');
    expect(body.data.item.address.length).toBeGreaterThan(0);
  });

});

test.describe('Assets & Addresses API - POST .../addresses - negative tests', () => {

  test('should return 409 when required label is missing', async ({ request }) => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    const path = endpoints.assetsAndAddresses.generateDepositAddress(testData.vaults.testVaultId, BLOCKCHAIN, NETWORK);
    const payload = payloads.assetsAndAddresses.generateDepositAddress({ vaultAccountId });
    const headers = generateHeaders('POST', path, payload);
    const res = await request.post(`${CONFIG.baseUrl}${path}`, { headers, data: payload });
    expect([400, 409]).toContain(res.status());
  });

  test('should return 403 when vaultId does not belong to the API key', async ({ request }) => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    const path = endpoints.assetsAndAddresses.generateDepositAddress('000000000000000000000000', BLOCKCHAIN, NETWORK);
    const payload = payloads.assetsAndAddresses.generateDepositAddress({ label, vaultAccountId });
    const headers = generateHeaders('POST', path, payload);
    const res = await request.post(`${CONFIG.baseUrl}${path}`, { headers, data: payload });
    expect(res.status()).toBe(403);
  });

  test('should return 415 when Content-Type is missing', async ({ request }) => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    const path = endpoints.assetsAndAddresses.generateDepositAddress(testData.vaults.testVaultId, BLOCKCHAIN, NETWORK);
    const payload = payloads.assetsAndAddresses.generateDepositAddress({ label, vaultAccountId });
    const headers = generateHeaders('POST', path, payload);
    delete headers['Content-Type'];
    const res = await request.post(`${CONFIG.baseUrl}${path}`, { headers, data: payload });
    expect(res.status()).toBe(415);
  });

});
