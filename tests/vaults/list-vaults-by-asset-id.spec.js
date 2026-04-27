const { test, expect } = require('@playwright/test');
const { generateHeaders, CONFIG } = require('../../auth/auth.js');
const endpoints = require('../../config/endpoints.js');
const testData = require('../../config/test-data.js');

let responseBitcoin;
let bodyBitcoin;
let responseEthereum;
let bodyEthereum;

test.beforeAll(async ({ request }) => {
  await new Promise(resolve => setTimeout(resolve, 1000));

  const pathBitcoin = endpoints.vaults.listByAssetId(
    testData.assets.bitcoin.assetId,
    testData.assets.bitcoin.blockchain,
    'test'
  );
  const headersBitcoin = generateHeaders('GET', pathBitcoin);
  responseBitcoin = await request.get(`${CONFIG.baseUrl}${pathBitcoin}`, { headers: headersBitcoin });
  bodyBitcoin = await responseBitcoin.json();

  await new Promise(resolve => setTimeout(resolve, 1000));

  const pathEthereum = endpoints.vaults.listByAssetId(
    testData.assets.ethereum.assetId,
    testData.assets.ethereum.blockchain,
    'test'
  );
  const headersEthereum = generateHeaders('GET', pathEthereum);
  responseEthereum = await request.get(`${CONFIG.baseUrl}${pathEthereum}`, { headers: headersEthereum });
  bodyEthereum = await responseEthereum.json();
});

test.describe('Vaults API - GET /assets/{assetId}/{blockchain}/vaults/test - Bitcoin', () => {

  test('should return status 200', async () => {
    expect(responseBitcoin.status()).toBe(200);
  });

  test('response should contain data field', async () => {
    expect(bodyBitcoin).toHaveProperty('data');
  });

  test('data should contain item field', async () => {
    expect(bodyBitcoin.data).toHaveProperty('item');
  });

  test('item should contain exchangeRateUnit as non-empty string', async () => {
    expect(bodyBitcoin.data.item).toHaveProperty('exchangeRateUnit');
    expect(typeof bodyBitcoin.data.item.exchangeRateUnit).toBe('string');
    expect(bodyBitcoin.data.item.exchangeRateUnit.length).toBeGreaterThan(0);
  });

  test('item should contain vaults as non-empty array', async () => {
    expect(bodyBitcoin.data.item).toHaveProperty('vaults');
    expect(Array.isArray(bodyBitcoin.data.item.vaults)).toBeTruthy();
    expect(bodyBitcoin.data.item.vaults.length).toBeGreaterThan(0);
  });

  test('each vault should have required fields with correct types', async () => {
    for (const vault of bodyBitcoin.data.item.vaults) {
      // string fields
      expect(typeof vault.vaultId).toBe('string');
      expect(vault.vaultId.length).toBeGreaterThan(0);

      expect(typeof vault.vaultName).toBe('string');
      expect(vault.vaultName.length).toBeGreaterThan(0);

      expect(typeof vault.vaultType).toBe('string');
      expect(vault.vaultType.length).toBeGreaterThan(0);

      expect(typeof vault.vaultColor).toBe('string');
      expect(vault.vaultColor.length).toBeGreaterThan(0);

      // amount fields - string representing numbers
      expect(typeof vault.totalAmount).toBe('string');
      expect(isNaN(parseFloat(vault.totalAmount))).toBeFalsy();

      expect(typeof vault.availableAmount).toBe('string');
      expect(isNaN(parseFloat(vault.availableAmount))).toBeFalsy();

      expect(typeof vault.allocatedAmount).toBe('string');
      expect(isNaN(parseFloat(vault.allocatedAmount))).toBeFalsy();
    }
  });

});

test.describe('Vaults API - GET /assets/{assetId}/{blockchain}/vaults/test - Ethereum', () => {

  test('should return status 200', async () => {
    expect(responseEthereum.status()).toBe(200);
  });

  test('response should contain data field', async () => {
    expect(bodyEthereum).toHaveProperty('data');
  });

  test('item should contain vaults as non-empty array', async () => {
    expect(bodyEthereum.data.item).toHaveProperty('vaults');
    expect(Array.isArray(bodyEthereum.data.item.vaults)).toBeTruthy();
    expect(bodyEthereum.data.item.vaults.length).toBeGreaterThan(0);
  });

  test('each vault should have required fields with correct types', async () => {
    for (const vault of bodyEthereum.data.item.vaults) {
      expect(typeof vault.vaultId).toBe('string');
      expect(vault.vaultId.length).toBeGreaterThan(0);

      expect(typeof vault.vaultName).toBe('string');
      expect(vault.vaultName.length).toBeGreaterThan(0);

      expect(typeof vault.totalAmount).toBe('string');
      expect(isNaN(parseFloat(vault.totalAmount))).toBeFalsy();

      expect(typeof vault.availableAmount).toBe('string');
      expect(isNaN(parseFloat(vault.availableAmount))).toBeFalsy();

      expect(typeof vault.allocatedAmount).toBe('string');
      expect(isNaN(parseFloat(vault.allocatedAmount))).toBeFalsy();
    }
  });

});