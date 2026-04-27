const { test, expect } = require('@playwright/test');
const { generateHeaders, CONFIG } = require('../../auth/auth.js');
const endpoints = require('../../config/endpoints.js');
const testData = require('../../config/test-data.js');

let response;
let body;

test.beforeAll(async ({ request }) => {
  await new Promise(resolve => setTimeout(resolve, 1000));
  const path = endpoints.vaults.listAssetsByVault(testData.vaults.testVaultId);
  const headers = generateHeaders('GET', path);
  response = await request.get(`${CONFIG.baseUrl}${path}`, { headers });
  body = await response.json();
});

test.describe('Vaults API - GET /vaults/{vaultId}/assets', () => {

  test('should return status 200', async () => {
    expect(response.status()).toBe(200);
  });

  test('response should contain data field', async () => {
    expect(body).toHaveProperty('data');
  });

  test('data should contain item field', async () => {
    expect(body.data).toHaveProperty('item');
  });

  test('item should contain assets as non-empty array', async () => {
    expect(body.data.item).toHaveProperty('assets');
    expect(Array.isArray(body.data.item.assets)).toBeTruthy();
    expect(body.data.item.assets.length).toBeGreaterThan(0);
  });

  test('each asset should have required fields with correct types', async () => {
    for (const asset of body.data.item.assets) {
      // assetId
      expect(typeof asset.assetId).toBe('string');
      expect(asset.assetId.length).toBeGreaterThan(0);

      // assetUnit
      expect(typeof asset.assetUnit).toBe('string');
      expect(asset.assetUnit.length).toBeGreaterThan(0);

      // blockchain
      expect(typeof asset.blockchain).toBe('string');
      expect(asset.blockchain.length).toBeGreaterThan(0);

      // network
      expect(typeof asset.network).toBe('string');
      expect(asset.network.length).toBeGreaterThan(0);

      // exchangeRateUnit
      expect(typeof asset.exchangeRateUnit).toBe('string');
      expect(isNaN(parseFloat(asset.exchangeRateUnit))).toBeFalsy();

      // type - трябва да е COIN или TOKEN
      expect(typeof asset.type).toBe('string');
      expect(['COIN', 'TOKEN']).toContain(asset.type);
    }
  });

  test('each asset should have assetData with correct types', async () => {
    for (const asset of body.data.item.assets) {
      expect(asset).toHaveProperty('assetData');

      // amount fields
      expect(typeof asset.assetData.totalAmount).toBe('string');
      expect(isNaN(parseFloat(asset.assetData.totalAmount))).toBeFalsy();

      expect(typeof asset.assetData.availableAmount).toBe('string');
      expect(isNaN(parseFloat(asset.assetData.availableAmount))).toBeFalsy();

      expect(typeof asset.assetData.allocatedAmount).toBe('string');
      expect(isNaN(parseFloat(asset.assetData.allocatedAmount))).toBeFalsy();
    }
  });

  test('response should contain apiVersion as non-empty string', async () => {
    expect(typeof body.apiVersion).toBe('string');
    expect(body.apiVersion.length).toBeGreaterThan(0);
  });

  test('response should contain requestId as non-empty string', async () => {
    expect(typeof body.requestId).toBe('string');
    expect(body.requestId.length).toBeGreaterThan(0);
  });

});