const { test, expect } = require('@playwright/test');
const { generateHeaders, CONFIG } = require('../../auth/auth.js');
const endpoints = require('../../config/endpoints.js');
const testData = require('../../config/test-data.js');

let response;
let body;

test.beforeAll(async ({ request }) => {
  await new Promise(resolve => setTimeout(resolve, 1000));
  const path = endpoints.vaultAccounts.getById(
    testData.vaults.testVaultId,
    testData.vaultAccounts.testVaultAccountId
  );
  const headers = generateHeaders('GET', path);
  response = await request.get(`${CONFIG.baseUrl}${path}`, { headers });
  body = await response.json();
});

test.describe('Vault Accounts API - GET /vaults/{vaultId}/vault-accounts/{vaultAccountId}/details', () => {

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

  test('item should have vaultAccountId equal to the requested id', async () => {
    expect(body.data.item.vaultAccountId).toBe(testData.vaultAccounts.testVaultAccountId);
  });

  test('item should have vaultId equal to the requested vaultId', async () => {
    expect(body.data.item.vaultId).toBe(testData.vaults.testVaultId);
  });

  test('item should have vaultAccountName as non-empty string', async () => {
    expect(typeof body.data.item.vaultAccountName).toBe('string');
    expect(body.data.item.vaultAccountName.length).toBeGreaterThan(0);
  });

  test('item should have vaultAccountColour as non-empty string', async () => {
    expect(typeof body.data.item.vaultAccountColour).toBe('string');
    expect(body.data.item.vaultAccountColour.length).toBeGreaterThan(0);
  });

  test('item should have index as non-empty string', async () => {
    expect(typeof body.data.item.index).toBe('string');
    expect(body.data.item.index.length).toBeGreaterThan(0);
  });

  test('item should have createdAt as integer', async () => {
    expect(typeof body.data.item.createdAt).toBe('number');
    expect(Number.isInteger(body.data.item.createdAt)).toBeTruthy();
  });

  test('item should have addressesCount as string', async () => {
    expect(typeof body.data.item.addressesCount).toBe('string');
  });

  test('item should have isHiddenInDashboard as boolean', async () => {
    expect(typeof body.data.item.isHiddenInDashboard).toBe('boolean');
  });

  test('item should have isFavorityInDashboard as boolean', async () => {
    expect(typeof body.data.item.isFavorityInDashboard).toBe('boolean');
  });

  test('item should have balances as array', async () => {
    expect(Array.isArray(body.data.item.balances)).toBeTruthy();
  });

});

test.describe('Vault Accounts API - GET /vaults/{vaultId}/vault-accounts/{vaultAccountId}/details - negative tests', () => {

  test('should return 404 when vaultAccountId does not exist', async ({ request }) => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    const path = endpoints.vaultAccounts.getById(
      testData.vaults.testVaultId,
      '000000000000000000000000'
    );
    const headers = generateHeaders('GET', path);
    const res = await request.get(`${CONFIG.baseUrl}${path}`, { headers });
    const resBody = await res.json();
    expect(res.status()).toBe(404);
    expect(resBody.error.code).toBe('resource_not_found');
  });

  test('should return 403 when vaultId does not exist', async ({ request }) => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    const path = endpoints.vaultAccounts.getById(
      '000000000000000000000000',
      testData.vaultAccounts.testVaultAccountId
    );
    const headers = generateHeaders('GET', path);
    const res = await request.get(`${CONFIG.baseUrl}${path}`, { headers });
    expect(res.status()).toBe(403);
  });

  test('should return 404 when vaultAccountId does not belong to the vaultId', async ({ request }) => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    const path = endpoints.vaultAccounts.getById(
      testData.vaults.createVaultAccountVaultId,
      testData.vaultAccounts.testVaultAccountId
    );
    const headers = generateHeaders('GET', path);
    const res = await request.get(`${CONFIG.baseUrl}${path}`, { headers });
    const resBody = await res.json();
    expect(res.status()).toBe(404);
    expect(resBody.error.code).toBe('resource_not_found');
  });

  test('should return 409 when vaultAccountId has invalid format', async ({ request }) => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    const path = endpoints.vaultAccounts.getById(
      testData.vaults.testVaultId,
      'invalid-id-format'
    );
    const headers = generateHeaders('GET', path);
    const res = await request.get(`${CONFIG.baseUrl}${path}`, { headers });
    expect(res.status()).toBe(409);
  });

  test('should return 403 when vaultId has invalid format', async ({ request }) => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    const path = endpoints.vaultAccounts.getById(
      '5457888888',
      testData.vaultAccounts.testVaultAccountId
    );
    const headers = generateHeaders('GET', path);
    const res = await request.get(`${CONFIG.baseUrl}${path}`, { headers });
    expect(res.status()).toBe(403);
  });

});