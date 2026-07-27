const { test, expect } = require('@playwright/test');
const { generateHeaders, CONFIG } = require('../../auth/auth.js');
const endpoints = require('../../config/endpoints.js');
const payloads = require('../../config/payloads.js');
const testData = require('../../config/test-data.js');

let response;
let body;
let vaultAccountId;
const newName = `Updated VA ${Date.now()}`;
const newColor = '#FF8A00';

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
  const path = endpoints.vaultAccounts.update(testData.vaults.testVaultId, vaultAccountId);
  const payload = payloads.vaultAccounts.update({ name: newName, color: newColor });
  const headers = generateHeaders('PUT', path, payload);
  response = await request.fetch(`${CONFIG.baseUrl}${path}`, { method: 'PUT', headers, data: payload });
  body = await response.json();
});

test.describe('Vault Accounts API - PUT /vaults/{vaultId}/vault-accounts/{vaultAccountId}/edit', () => {

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

  test('data should contain item field', async () => {
    expect(body.data).toHaveProperty('item');
  });

  test('item should reflect the updated name', async () => {
    expect(body.data.item.vaultAccountName).toBe(newName);
  });

  test('item should reflect the updated color', async () => {
    expect(typeof body.data.item.vaultAccountColour).toBe('string');
    expect(body.data.item.vaultAccountColour.toUpperCase()).toBe(newColor.toUpperCase());
  });

});

test.describe('Vault Accounts API - PUT /vaults/{vaultId}/vault-accounts/{vaultAccountId}/edit - negative tests', () => {

  test('should return 404 when vaultAccountId does not exist', async ({ request }) => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    const path = endpoints.vaultAccounts.update(testData.vaults.testVaultId, '000000000000000000000000');
    const payload = payloads.vaultAccounts.update({ name: 'Nope' });
    const headers = generateHeaders('PUT', path, payload);
    const res = await request.fetch(`${CONFIG.baseUrl}${path}`, { method: 'PUT', headers, data: payload });
    expect([404, 409]).toContain(res.status());
  });

  test('should return 403 when vaultId does not belong to the API key', async ({ request }) => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    const path = endpoints.vaultAccounts.update('000000000000000000000000', vaultAccountId);
    const payload = payloads.vaultAccounts.update({ name: 'Nope' });
    const headers = generateHeaders('PUT', path, payload);
    const res = await request.fetch(`${CONFIG.baseUrl}${path}`, { method: 'PUT', headers, data: payload });
    expect(res.status()).toBe(403);
  });

  test('should return 401 when signature is invalid', async ({ request }) => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    const path = endpoints.vaultAccounts.update(testData.vaults.testVaultId, vaultAccountId);
    const payload = payloads.vaultAccounts.update({ name: 'Nope' });
    const headers = generateHeaders('PUT', path, payload);
    headers['x-api-sign'] = 'invalid-signature';
    const res = await request.fetch(`${CONFIG.baseUrl}${path}`, { method: 'PUT', headers, data: payload });
    const resBody = await res.json();
    expect(res.status()).toBe(401);
    expect(resBody.error.code).toBe('invalid_api_sign');
  });

});
