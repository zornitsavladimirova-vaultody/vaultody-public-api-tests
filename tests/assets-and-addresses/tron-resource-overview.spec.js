const { test, expect } = require('@playwright/test');
const { generateHeaders, CONFIG } = require('../../auth/auth.js');
const endpoints = require('../../config/endpoints.js');
const testData = require('../../config/test-data.js');

// Requires a real Tron address held in a Tron vault. Fill testData.tron.{vaultId,overviewAddress}
// to enable; otherwise the suite auto-skips.
const hasTronData = Boolean(testData.tron.vaultId && testData.tron.overviewAddress);

let response;
let body;

test.beforeAll(async ({ request }) => {
  if (!hasTronData) return;
  await new Promise(resolve => setTimeout(resolve, 1000));
  const path = endpoints.assetsAndAddresses.tronResourceOverview(
    testData.tron.vaultId,
    testData.tron.blockchain,
    testData.tron.network,
    testData.tron.overviewAddress
  );
  const headers = generateHeaders('GET', path);
  response = await request.get(`${CONFIG.baseUrl}${path}`, { headers });
  body = await response.json();
});

test.describe('Assets & Addresses API - GET /vaults/{vaultId}/{blockchain}/{network}/{address}/overview', () => {

  test('should return status 200', async () => {
    test.skip(!hasTronData, 'testData.tron.vaultId / overviewAddress not set');
    expect(response.status()).toBe(200);
  });

  test('response should contain apiVersion and requestId', async () => {
    test.skip(!hasTronData, 'testData.tron.vaultId / overviewAddress not set');
    expect(typeof body.apiVersion).toBe('string');
    expect(typeof body.requestId).toBe('string');
  });

  test('item should contain the queried address and network', async () => {
    test.skip(!hasTronData, 'testData.tron.vaultId / overviewAddress not set');
    expect(body.data.item.address).toBe(testData.tron.overviewAddress);
    expect(typeof body.data.item.network).toBe('string');
  });

  test('item should contain a balance object with total and unit', async () => {
    test.skip(!hasTronData, 'testData.tron.vaultId / overviewAddress not set');
    expect(body.data.item).toHaveProperty('balance');
    expect(typeof body.data.item.balance.total).toBe('string');
    expect(typeof body.data.item.balance.unit).toBe('string');
  });

  test('item should contain resources with bandwidth and energy', async () => {
    test.skip(!hasTronData, 'testData.tron.vaultId / overviewAddress not set');
    expect(body.data.item).toHaveProperty('resources');
    expect(body.data.item.resources).toHaveProperty('bandwidth');
    expect(body.data.item.resources).toHaveProperty('energy');
  });

});

test.describe('Assets & Addresses API - GET .../overview - negative tests', () => {

  test('should return 403 when vaultId does not belong to the API key', async ({ request }) => {
    test.skip(!hasTronData, 'testData.tron.vaultId / overviewAddress not set');
    await new Promise(resolve => setTimeout(resolve, 1000));
    const path = endpoints.assetsAndAddresses.tronResourceOverview(
      '000000000000000000000000', testData.tron.blockchain, testData.tron.network, testData.tron.overviewAddress
    );
    const res = await request.get(`${CONFIG.baseUrl}${path}`, { headers: generateHeaders('GET', path) });
    expect(res.status()).toBe(403);
  });

});
