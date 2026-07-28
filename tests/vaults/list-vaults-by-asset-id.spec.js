const { test, expect } = require('@playwright/test');
const { generateHeaders, CONFIG } = require('../../auth/auth.js');
const endpoints = require('../../config/endpoints.js');
const testData = require('../../config/test-data.js');

// One describe block per asset in config/test-data.js, so adding an asset there extends this
// coverage automatically instead of needing another copy-pasted block.
//
// Verified on QA-01 (2026-07-27) across all 32 fixture assets: every one answers 200 with
// data.item.vaults as an array, and exchangeRateUnit is always present. However 6 of the 32
// legitimately return an EMPTY array because no test vault holds them (ethereum-classic, and the
// ethereum/BSC LINK, USDT, USDC and BUSD tokens). Zero is a valid answer for "list the vaults
// holding this asset", so asserting a non-empty list would be testing the fixture data rather than
// the API. The per-vault field test instead skips - visibly, with a reason - when the list is
// empty; looping over an empty array would otherwise run zero assertions and report a false pass.

const NETWORK_TYPE = 'test';

for (const [assetKey, asset] of Object.entries(testData.assets)) {

  test.describe(`Vaults API - GET /assets/{assetId}/${asset.blockchain}/vaults/${NETWORK_TYPE} - ${assetKey} (${asset.assetUnit})`, () => {

    let response;
    let body;

    test.beforeAll(async ({ request }, testInfo) => {
      await new Promise(resolve => setTimeout(resolve, 1000));
      const path = endpoints.vaults.listByAssetId(asset.assetId, asset.blockchain, NETWORK_TYPE);
      const headers = generateHeaders('GET', path);
      const url = `${CONFIG.baseUrl}${path}`;

      response = await request.get(url, { headers });
      body = await response.json();

      // Attach request details
      await testInfo.attach('request', {
        body: JSON.stringify({ method: 'GET', url, headers }, null, 2),
        contentType: 'application/json',
      });

      // Attach response details
      await testInfo.attach('response', {
        body: JSON.stringify({ status: response.status(), body }, null, 2),
        contentType: 'application/json',
      });
    });

    test('should return status 200', async () => {
      expect(response.status()).toBe(200);
    });

    test('response should contain data field', async () => {
      expect(body).toHaveProperty('data');
    });

    test('data should contain item field', async () => {
      expect(body.data).toHaveProperty('item');
    });

    test('item should contain exchangeRateUnit as non-empty string', async () => {
      expect(body.data.item).toHaveProperty('exchangeRateUnit');
      expect(typeof body.data.item.exchangeRateUnit).toBe('string');
      expect(body.data.item.exchangeRateUnit.length).toBeGreaterThan(0);
      expect(isNaN(parseFloat(body.data.item.exchangeRateUnit))).toBeFalsy();
    });

    test('item should contain vaults as an array', async () => {
      expect(body.data.item).toHaveProperty('vaults');
      expect(Array.isArray(body.data.item.vaults)).toBeTruthy();
    });

    test('each vault should have required fields with correct types', async () => {
      test.skip(
        !body.data.item.vaults.length,
        `No test vault holds ${asset.assetUnit} on ${asset.blockchain} - nothing to assert`
      );

      for (const vault of body.data.item.vaults) {
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

}
