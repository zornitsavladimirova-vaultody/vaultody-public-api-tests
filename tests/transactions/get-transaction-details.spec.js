const { test, expect } = require('@playwright/test');
const { generateHeaders, CONFIG } = require('../../auth/auth.js');
const endpoints = require('../../config/endpoints.js');
const testData = require('../../config/test-data.js');

let response;
let body;
let discovered; // { blockchain, transactionId }

async function discoverTransaction(request) {
  const listPath = endpoints.vaults.listTransactionsByVault(testData.vaults.testVaultId);
  const res = await request.get(`${CONFIG.baseUrl}${listPath}`, { headers: generateHeaders('GET', listPath) });
  const items = (await res.json()).data.items;
  if (!items.length) return null;
  return { blockchain: items[0].blockchain, transactionId: items[0].transactionId };
}

test.beforeAll(async ({ request }) => {
  await new Promise(resolve => setTimeout(resolve, 1000));
  discovered = await discoverTransaction(request);
  if (!discovered) return;

  await new Promise(resolve => setTimeout(resolve, 1000));
  const path = endpoints.transactions.getTransactionDetails(testData.vaults.testVaultId, discovered.blockchain, discovered.transactionId);
  const headers = generateHeaders('GET', path);
  response = await request.get(`${CONFIG.baseUrl}${path}`, { headers });
  body = await response.json();
});

test.describe('Transactions API - GET /vaults/{vaultId}/{blockchain}/transactions/{transactionId}', () => {

  test('should return status 200', async () => {
    test.skip(!discovered, 'No transactions in the test vault to fetch details for');
    expect(response.status()).toBe(200);
  });

  test('response should contain apiVersion and requestId', async () => {
    test.skip(!discovered, 'No transactions in the test vault to fetch details for');
    expect(typeof body.apiVersion).toBe('string');
    expect(typeof body.requestId).toBe('string');
  });

  test('response should contain data field with item', async () => {
    test.skip(!discovered, 'No transactions in the test vault to fetch details for');
    expect(body).toHaveProperty('data');
    expect(body.data).toHaveProperty('item');
  });

  // This route does not echo its path params: `item` carries neither `transactionId` nor
  // `blockchain`, so the response cannot be matched back to the request by id from the body alone.
  // `minedInBlockHeight` is deliberately not asserted here — it is missing for Solana
  // transactions (see the BUG note in list-transactions-by-vault.spec.js), and which chain the
  // discovered transaction belongs to varies per run.
  test('item should have core fields with correct types', async () => {
    test.skip(!discovered, 'No transactions in the test vault to fetch details for');
    const item = body.data.item;

    expect(typeof item.network).toBe('string');
    expect(item.network.length).toBeGreaterThan(0);

    expect(typeof item.status).toBe('string');
    expect(item.status.length).toBeGreaterThan(0);

    expect(typeof item.direction).toBe('string');
    expect(['incoming', 'outgoing', 'client-internal']).toContain(item.direction);

    expect(typeof item.dateTime).toBe('number');
    expect(Number.isInteger(item.dateTime)).toBeTruthy();

    expect(Array.isArray(item.senders)).toBeTruthy();
    expect(Array.isArray(item.recipients)).toBeTruthy();
    expect(Array.isArray(item.internalTransfers)).toBeTruthy();
    expect(Array.isArray(item.tokensTransfers)).toBeTruthy();

    expect(typeof item.transactionFee.amount).toBe('string');
    expect(isNaN(parseFloat(item.transactionFee.amount))).toBeFalsy();
    expect(typeof item.transactionFee.amountUnit).toBe('string');
    expect(item.transactionFee.amountUnit.length).toBeGreaterThan(0);
  });

});

test.describe('Transactions API - GET .../transactions/{transactionId} - negative tests', () => {

  test('should return 404 for a non-existent transactionId', async ({ request }) => {
    test.skip(!discovered, 'No transactions in the test vault to fetch details for');
    await new Promise(resolve => setTimeout(resolve, 1000));
    const path = endpoints.transactions.getTransactionDetails(testData.vaults.testVaultId, discovered.blockchain, '0'.repeat(64));
    const res = await request.get(`${CONFIG.baseUrl}${path}`, { headers: generateHeaders('GET', path) });
    expect([404, 409]).toContain(res.status());
  });

  test('should return 403 when vaultId does not belong to the API key', async ({ request }) => {
    test.skip(!discovered, 'No transactions in the test vault to fetch details for');
    await new Promise(resolve => setTimeout(resolve, 1000));
    const path = endpoints.transactions.getTransactionDetails('000000000000000000000000', discovered.blockchain, discovered.transactionId);
    const res = await request.get(`${CONFIG.baseUrl}${path}`, { headers: generateHeaders('GET', path) });
    expect(res.status()).toBe(403);
  });

});
