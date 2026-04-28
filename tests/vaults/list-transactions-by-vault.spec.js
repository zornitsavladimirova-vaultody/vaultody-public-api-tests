const { test, expect } = require('@playwright/test');
const { generateHeaders, CONFIG } = require('../../auth/auth.js');
const endpoints = require('../../config/endpoints.js');
const testData = require('../../config/test-data.js');

let response;
let body;

test.beforeAll(async ({ request }) => {
  await new Promise(resolve => setTimeout(resolve, 1000));
  const path = endpoints.vaults.listTransactionsByVault(testData.vaults.testVaultId);
  const headers = generateHeaders('GET', path);
  response = await request.get(`${CONFIG.baseUrl}${path}`, { headers });
  body = await response.json();
});

test.describe('Vaults API - GET /vaults/{vaultId}/transactions', () => {

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

      expect(typeof tx.direction).toBe('string');
      expect(['incoming', 'outgoing']).toContain(tx.direction);

      expect(typeof tx.status).toBe('string');
      expect(tx.status.length).toBeGreaterThan(0);

      expect(typeof tx.transactionId).toBe('string');
      expect(tx.transactionId.length).toBeGreaterThan(0);

      // BUG: minedInBlockHeight is missing for Solana transactions
      expect(typeof tx.minedInBlockHeight).toBe('string');
      expect(tx.minedInBlockHeight.length).toBeGreaterThan(0);

      expect(typeof tx.createdTimestamp).toBe('number');
      expect(Number.isInteger(tx.createdTimestamp)).toBeTruthy();

      expect(['true', 'false', true, false]).toContain(tx.hasTokenTransfer);
      expect(['true', 'false', true, false]).toContain(tx.isInternal);
    }
  });

  test('each transaction should have valid senders and recipients', async () => {
    for (const tx of body.data.items) {
      expect(Array.isArray(tx.senders)).toBeTruthy();
      expect(Array.isArray(tx.recipients)).toBeTruthy();

      for (const sender of tx.senders) {
        expect(typeof sender.address).toBe('string');
        expect(sender.address.length).toBeGreaterThan(0);
        expect(typeof sender.amount).toBe('string');
        expect(typeof sender.amountUnit).toBe('string');
        expect(sender.amountUnit.length).toBeGreaterThan(0);
      }

      for (const recipient of tx.recipients) {
        expect(typeof recipient.address).toBe('string');
        expect(recipient.address.length).toBeGreaterThan(0);
        expect(typeof recipient.amount).toBe('string');
        expect(typeof recipient.amountUnit).toBe('string');
        expect(recipient.amountUnit.length).toBeGreaterThan(0);
      }
    }
  });

  test('each transaction should have valid transactionFee', async () => {
    for (const tx of body.data.items) {
      expect(tx).toHaveProperty('transactionFee');
      expect(typeof tx.transactionFee.amount).toBe('string');
      expect(typeof tx.transactionFee.amountUnit).toBe('string');
      expect(tx.transactionFee.amountUnit.length).toBeGreaterThan(0);
    }
  });

});

test.describe('Vaults API - GET /vaults/{vaultId}/transactions - pagination', () => {

  test('should return correct number of items when limit is set to 2', async ({ request }) => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    const path = endpoints.vaults.listTransactionsByVault(testData.vaults.testVaultId);
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
    const path = endpoints.vaults.listTransactionsByVault(testData.vaults.testVaultId);
    const queryParams1 = { limit: '1' };
    const headers1 = generateHeaders('GET', path, {}, queryParams1);
    const response1 = await request.get(`${CONFIG.baseUrl}${path}`, {
      headers: headers1,
      params: queryParams1
    });
    const body1 = await response1.json();
    expect(response1.status()).toBe(200);

    if (body1.data.hasMore) {
      const firstId = body1.data.items[0].id;
      const queryParams2 = { limit: '1', startingAfter: firstId };
      const headers2 = generateHeaders('GET', path, {}, queryParams2);
      const response2 = await request.get(`${CONFIG.baseUrl}${path}`, {
        headers: headers2,
        params: queryParams2
      });
      const body2 = await response2.json();
      expect(response2.status()).toBe(200);
      expect(body2.data.items[0].id).not.toBe(firstId);
    } else {
      console.log('Only one page of transactions exists - skipping startingAfter test');
    }
  });

});