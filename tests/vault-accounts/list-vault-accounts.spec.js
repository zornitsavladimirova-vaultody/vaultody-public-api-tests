const { test, expect } = require('@playwright/test');
const { generateHeaders, CONFIG } = require('../../auth/auth.js');
const endpoints = require('../../config/endpoints.js');
const testData = require('../../config/test-data.js');

let response;
let body;

test.beforeAll(async ({ request }) => {
  await new Promise(resolve => setTimeout(resolve, 1000));
  const path = endpoints.vaultAccounts.list(testData.vaults.testVaultId);
  const headers = generateHeaders('GET', path);
  response = await request.get(`${CONFIG.baseUrl}${path}`, { headers });
  body = await response.json();
});

test.describe('Vault Accounts API - GET /vaults/{vaultId}/vault-accounts/details', () => {

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

  test('data should return default limit of 50', async () => {
    expect(body.data.limit).toBe(50);
  });

  test('data should contain hasMore as boolean', async () => {
    expect(body.data).toHaveProperty('hasMore');
    expect(typeof body.data.hasMore).toBe('boolean');
  });

  test('data should contain items as non-empty array', async () => {
    expect(body.data).toHaveProperty('items');
    expect(Array.isArray(body.data.items)).toBeTruthy();
    expect(body.data.items.length).toBeGreaterThan(0);
  });

  test('each vault account should have required fields with correct types', async () => {
    for (const va of body.data.items) {
      expect(typeof va.vaultAccountId).toBe('string');
      expect(va.vaultAccountId.length).toBeGreaterThan(0);

      expect(typeof va.vaultAccountName).toBe('string');
      expect(va.vaultAccountName.length).toBeGreaterThan(0);

      expect(typeof va.vaultId).toBe('string');
      expect(va.vaultId.length).toBeGreaterThan(0);

      expect(typeof va.vaultAccountColour).toBe('string');
      expect(va.vaultAccountColour.length).toBeGreaterThan(0);

      expect(typeof va.addressesCount).toBe('string');

      expect(typeof va.index).toBe('number');
      expect(Number.isInteger(va.index)).toBeTruthy();

      expect(typeof va.createdAt).toBe('number');
      expect(Number.isInteger(va.createdAt)).toBeTruthy();

      expect(typeof va.isHiddenInDashboard).toBe('boolean');
      expect(typeof va.isFavoriteInDashboard).toBe('boolean');

      expect(Array.isArray(va.balances)).toBeTruthy();
    }
  });

  test('each vault account should belong to the requested vault', async () => {
    for (const va of body.data.items) {
      expect(va.vaultId).toBe(testData.vaults.testVaultId);
    }
  });

});

test.describe('Vault Accounts API - GET /vaults/{vaultId}/vault-accounts/details - pagination', () => {

  test('should return correct number of items when limit is set to 2', async ({ request }) => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    const path = endpoints.vaultAccounts.list(testData.vaults.testVaultId);
    const queryParams = { limit: '2' };
    const headers = generateHeaders('GET', path, {}, queryParams);
    const res = await request.get(`${CONFIG.baseUrl}${path}`, {
      headers,
      params: queryParams
    });
    const b = await res.json();
    expect(res.status()).toBe(200);
    expect(b.data.items.length).toBeLessThanOrEqual(2);
  });

  test('should paginate correctly using startingAfter', async ({ request }) => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    const path = endpoints.vaultAccounts.list(testData.vaults.testVaultId);
    const queryParams1 = { limit: '1' };
    const headers1 = generateHeaders('GET', path, {}, queryParams1);
    const response1 = await request.get(`${CONFIG.baseUrl}${path}`, {
      headers: headers1,
      params: queryParams1
    });
    const body1 = await response1.json();
    expect(response1.status()).toBe(200);

    if (body1.data.hasMore) {
      const firstId = body1.data.items[0].vaultAccountId;
      const queryParams2 = { limit: '1', startingAfter: firstId };
      const headers2 = generateHeaders('GET', path, {}, queryParams2);
      const response2 = await request.get(`${CONFIG.baseUrl}${path}`, {
        headers: headers2,
        params: queryParams2
      });
      const body2 = await response2.json();
      expect(response2.status()).toBe(200);
      expect(body2.data.items[0].vaultAccountId).not.toBe(firstId);
    } else {
      console.log('Only one page of vault accounts exists - skipping startingAfter test');
    }
  });

  test('should return only hidden vault accounts when isHidden is true', async ({ request }) => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    const path = endpoints.vaultAccounts.list(testData.vaults.testVaultId);
    const queryParams = { isHidden: 'true' };
    const headers = generateHeaders('GET', path, {}, queryParams);
    const res = await request.get(`${CONFIG.baseUrl}${path}`, {
      headers,
      params: queryParams
    });
    const b = await res.json();
    expect(res.status()).toBe(200);
    for (const va of b.data.items) {
      expect(va.isHiddenInDashboard).toBe(true);
    }
  });

  test('should return only vault accounts with balance when isHideEmpty is true', async ({ request }) => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    const path = endpoints.vaultAccounts.list(testData.vaults.testVaultId);
    const queryParams = { isHideEmpty: 'true' };
    const headers = generateHeaders('GET', path, {}, queryParams);
    const res = await request.get(`${CONFIG.baseUrl}${path}`, {
      headers,
      params: queryParams
    });
    const b = await res.json();
    expect(res.status()).toBe(200);
    for (const va of b.data.items) {
      expect(va.balances.length).toBeGreaterThan(0);
    }
 });

});