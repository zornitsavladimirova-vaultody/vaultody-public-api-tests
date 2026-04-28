const { test, expect } = require('@playwright/test');
const { generateHeaders, CONFIG } = require('../../auth/auth.js');
const endpoints = require('../../config/endpoints.js');
const payloads = require('../../config/payloads.js');
const testData = require('../../config/test-data.js');

let response;
let body;
const uniqueName = `Test VA ${Date.now()}`;

test.beforeAll(async ({ request }) => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    const path = endpoints.vaultAccounts.create(testData.vaults.createVaultAccountVaultId);
    const payload = payloads.vaultAccounts.create(uniqueName);
    const headers = generateHeaders('POST', path, payload);
    response = await request.post(`${CONFIG.baseUrl}${path}`, {
        headers,
        data: payload
    });
    body = await response.json();
});

test.describe('Vault Accounts API - POST /vaults/{vaultId}/vault-account', () => {

    test('should return status 201', async () => {
        expect(response.status()).toBe(201);
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

    test('item should have vaultAccountId as non-empty string', async () => {
        expect(typeof body.data.item.vaultAccountId).toBe('string');
        expect(body.data.item.vaultAccountId.length).toBeGreaterThan(0);
    });

    test('item should have vaultAccountName equal to the requested name', async () => {
        expect(body.data.item.vaultAccountName).toBe(uniqueName);
    });

    test('item should have vaultId equal to the requested vaultId', async () => {
        expect(body.data.item.vaultId).toBe(testData.vaults.createVaultAccountVaultId);
    });

    test('item should have vaultAccountColour as non-empty string', async () => {
        expect(typeof body.data.item.vaultAccountColour).toBe('string');
        expect(body.data.item.vaultAccountColour.length).toBeGreaterThan(0);
    });

    test('item should have isHiddenInDashboard as boolean', async () => {
        expect(typeof body.data.item.isHiddenInDashboard).toBe('boolean');
        expect(body.data.item.isHiddenInDashboard).toBe(false);
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

    test('item should have balances as array', async () => {
        expect(Array.isArray(body.data.item.balances)).toBeTruthy();
    });

});

test.describe('Vault Accounts API - POST /vaults/{vaultId}/vault-account - negative tests', () => {

    test('should return 403 when vaultId does not exist', async ({ request }) => {
        await new Promise(resolve => setTimeout(resolve, 1000));
        const path = endpoints.vaultAccounts.create('69e5ef5a859b6c00073fa811');
        const payload = payloads.vaultAccounts.create('Test VA Invalid');
        const headers = generateHeaders('POST', path, payload);
        const res = await request.post(`${CONFIG.baseUrl}${path}`, {
            headers,
            data: payload
        });
        const resBody = await res.json();
        expect(res.status()).toBe(403);
        expect(resBody.error.code).toBe('api_key_not_allowed_for_wallet');
    });

    test('should return 409 when name is missing', async ({ request }) => {
        await new Promise(resolve => setTimeout(resolve, 1000));
        const path = endpoints.vaultAccounts.create(testData.vaults.createVaultAccountVaultId);
        const payload = {
            data: {
                item: {
                    color: '#00C7E6',
                    isHiddenInDashboard: false
                }
            }
        };
        const headers = generateHeaders('POST', path, payload);
        const res = await request.post(`${CONFIG.baseUrl}${path}`, {
            headers,
            data: payload
        });
        const resBody = await res.json();
        expect(res.status()).toBe(409);
        expect(resBody.error.code).toBe('missing_required_attributes');
        expect(resBody.error.details[0].attribute).toBe('name');
    });

    test('should return 403 when vault is not backuped', async ({ request }) => {
        await new Promise(resolve => setTimeout(resolve, 1000));
        const path = endpoints.vaultAccounts.create(testData.vaults.notBackupedVaultId);
        const payload = payloads.vaultAccounts.create('Test VA Not Backuped');
        const headers = generateHeaders('POST', path, payload);
        const res = await request.post(`${CONFIG.baseUrl}${path}`, {
            headers,
            data: payload
        });
        const resBody = await res.json();
        expect(res.status()).toBe(403);
        expect(resBody.error.code).toBe('vault_as_a_service_vault_recovery_not_initialized');
    });

});