const { test, expect } = require('@playwright/test');
const { generateHeaders, CONFIG } = require('../../auth/auth.js');
const endpoints = require('../../config/endpoints.js');
const testData = require('../../config/test-data.js');

let response;
let body;

test.beforeAll(async ({ request }) => {
  await new Promise(resolve => setTimeout(resolve, 1000));
  const path = endpoints.transactions.listUtxos(testData.vaults.testVaultId);
  const headers = generateHeaders('GET', path);
  response = await request.get(`${CONFIG.baseUrl}${path}`, { headers });
  body = await response.json();
});

test.describe('Transactions API - GET /vaults/{vaultId}/utxos', () => {

  test('should return status 200', async () => {
    expect(response.status()).toBe(200);
  });

  test('response should contain apiVersion and requestId', async () => {
    expect(typeof body.apiVersion).toBe('string');
    expect(typeof body.requestId).toBe('string');
  });

  test('response should contain data field', async () => {
    expect(body).toHaveProperty('data');
  });

  test('data should contain items as array', async () => {
    expect(body.data).toHaveProperty('items');
    expect(Array.isArray(body.data.items)).toBeTruthy();
  });

  test('each UTXO should have required fields with correct types', async () => {
    for (const utxo of body.data.items) {
      expect(typeof utxo.utxoId).toBe('string');
      expect(utxo.utxoId.length).toBeGreaterThan(0);

      expect(typeof utxo.address).toBe('string');
      expect(utxo.address.length).toBeGreaterThan(0);

      expect(typeof utxo.assetId).toBe('string');
      expect(typeof utxo.transactionId).toBe('string');
      expect(typeof utxo.isSpent).toBe('boolean');

      expect(utxo).toHaveProperty('value');
      expect(typeof utxo.value.amount).toBe('string');
      expect(typeof utxo.value.assetUnit).toBe('string');
    }
  });

});

test.describe('Transactions API - GET /vaults/{vaultId}/utxos - negative tests', () => {

  test('should return 403 when vaultId does not belong to the API key', async ({ request }) => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    const path = endpoints.transactions.listUtxos('000000000000000000000000');
    const res = await request.get(`${CONFIG.baseUrl}${path}`, { headers: generateHeaders('GET', path) });
    expect(res.status()).toBe(403);
  });

  test('should return 401 when signature is invalid', async ({ request }) => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    const path = endpoints.transactions.listUtxos(testData.vaults.testVaultId);
    const headers = generateHeaders('GET', path);
    headers['x-api-sign'] = 'invalid-signature';
    const res = await request.get(`${CONFIG.baseUrl}${path}`, { headers });
    const resBody = await res.json();
    expect(res.status()).toBe(401);
    expect(resBody.error.code).toBe('invalid_api_sign');
  });

});
