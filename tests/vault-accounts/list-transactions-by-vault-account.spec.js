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
  const path = endpoints.vaultAccounts.listTransactions(testData.vaults.testVaultId, vaultAccountId);
  const headers = generateHeaders('GET', path);
  response = await request.get(`${CONFIG.baseUrl}${path}`, { headers });
  body = await response.json();
});

test.describe('Vault Accounts API - GET /vaults/{vaultId}/vault-accounts/{vaultAccountId}/transactions', () => {

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

  test('data should contain limit as integer', async () => {
    expect(body.data).toHaveProperty('limit');
    expect(typeof body.data.limit).toBe('number');
    expect(Number.isInteger(body.data.limit)).toBeTruthy();
  });

  // default_limit is configured per route, not globally: this vault-account route defaults to 10,
  // while the vault-level GET /vaults/{vaultId}/transactions defaults to 50.
  test('data should return default limit of 10', async () => {
    expect(body.data.limit).toBe(10);
  });

  test('data should contain hasMore as boolean', async () => {
    expect(body.data).toHaveProperty('hasMore');
    expect(typeof body.data.hasMore).toBe('boolean');
  });

  test('data should contain items as array', async () => {
    expect(body.data).toHaveProperty('items');
    expect(Array.isArray(body.data.items)).toBeTruthy();
  });

  test('each transaction should have required fields with correct types', async () => {
    for (const tx of body.data.items) {
      expect(typeof tx.id).toBe('string');
      expect(tx.id.length).toBeGreaterThan(0);

      expect(typeof tx.blockchain).toBe('string');
      expect(tx.blockchain.length).toBeGreaterThan(0);

      expect(typeof tx.network).toBe('string');
      expect(tx.network.length).toBeGreaterThan(0);

      // 'client-internal' is a real third value: a transfer whose sender and recipient both
      // belong to the same client never leaves the platform, so it is neither in nor out.
      expect(typeof tx.direction).toBe('string');
      expect(['incoming', 'outgoing', 'client-internal']).toContain(tx.direction);

      expect(typeof tx.status).toBe('string');
      expect(tx.status.length).toBeGreaterThan(0);
    }
  });

});

test.describe('Vault Accounts API - GET /vaults/{vaultId}/vault-accounts/{vaultAccountId}/transactions - pagination', () => {

  test('should return correct number of items when limit is set to 2', async ({ request }) => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    const path = endpoints.vaultAccounts.listTransactions(testData.vaults.testVaultId, vaultAccountId);
    const queryParams = { limit: '2' };
    const headers = generateHeaders('GET', path, {}, queryParams);
    const res = await request.get(`${CONFIG.baseUrl}${path}`, { headers, params: queryParams });
    const b = await res.json();
    expect(res.status()).toBe(200);
    expect(b.data.items.length).toBeLessThanOrEqual(2);
  });

});

test.describe('Vault Accounts API - GET /vaults/{vaultId}/vault-accounts/{vaultAccountId}/transactions - negative tests', () => {

  test('should return 404 when vaultAccountId does not exist', async ({ request }) => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    const path = endpoints.vaultAccounts.listTransactions(testData.vaults.testVaultId, '000000000000000000000000');
    const res = await request.get(`${CONFIG.baseUrl}${path}`, { headers: generateHeaders('GET', path) });
    expect([404, 409]).toContain(res.status());
  });

  test('should return 403 when vaultId does not belong to the API key', async ({ request }) => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    const path = endpoints.vaultAccounts.listTransactions('000000000000000000000000', vaultAccountId);
    const res = await request.get(`${CONFIG.baseUrl}${path}`, { headers: generateHeaders('GET', path) });
    expect(res.status()).toBe(403);
  });

});
