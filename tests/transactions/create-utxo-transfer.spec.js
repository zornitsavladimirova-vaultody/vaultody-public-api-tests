const { test, expect } = require('@playwright/test');
const { generateHeaders, CONFIG } = require('../../auth/auth.js');
const endpoints = require('../../config/endpoints.js');
const payloads = require('../../config/payloads.js');
const testData = require('../../config/test-data.js');

// DESTRUCTIVE: creates a real UTXO transaction-request.
const RUN_DESTRUCTIVE = process.env.RUN_DESTRUCTIVE === 'true';
const hasData = Boolean(testData.testnet.utxoId && testData.testnet.toAddress);
const canRunPositive = RUN_DESTRUCTIVE && hasData;

test.describe('Transactions API - POST /vaults/{vaultId}/transaction-requests/utxo-transfer - positive', () => {

  test('should create a UTXO transfer transaction request', async ({ request }) => {
    test.skip(!canRunPositive, 'Set RUN_DESTRUCTIVE=true and testData.testnet.{utxoId,toAddress}');
    await new Promise(resolve => setTimeout(resolve, 1000));
    const path = endpoints.transactions.utxoTransfer(testData.vaults.testVaultId);
    const payload = payloads.transactions.utxoTransfer({
      assetId: testData.assets.bitcoin.assetId,
      feePriority: 'standard',
      note: 'pw-utxo-transfer',
      recipients: [{ address: testData.testnet.toAddress, amount: '0.00001' }],
      senders: [{ utxoId: testData.testnet.utxoId }],
    });
    const headers = generateHeaders('POST', path, payload);
    const res = await request.post(`${CONFIG.baseUrl}${path}`, { headers, data: payload });
    const body = await res.json();
    expect([200, 201]).toContain(res.status());
    expect(typeof body.data.item.transactionRequestId).toBe('string');
    expect(body.data.item.transactionRequestId.length).toBeGreaterThan(0);
  });

});

test.describe('Transactions API - POST .../utxo-transfer - negative tests', () => {

  test('should return 400/409 when required recipients/senders are missing', async ({ request }) => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    const path = endpoints.transactions.utxoTransfer(testData.vaults.testVaultId);
    const payload = payloads.transactions.utxoTransfer({
      assetId: testData.assets.bitcoin.assetId, feePriority: 'standard', note: 'pw-utxo-missing',
    });
    const headers = generateHeaders('POST', path, payload);
    const res = await request.post(`${CONFIG.baseUrl}${path}`, { headers, data: payload });
    expect([400, 409, 422]).toContain(res.status());
  });

  test('should return 403 when vaultId does not belong to the API key', async ({ request }) => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    const path = endpoints.transactions.utxoTransfer('000000000000000000000000');
    const payload = payloads.transactions.utxoTransfer({
      assetId: testData.assets.bitcoin.assetId, feePriority: 'standard', note: 'n',
      recipients: [{ address: 'y', amount: '0.00001' }], senders: [{ utxoId: 'x' }],
    });
    const headers = generateHeaders('POST', path, payload);
    const res = await request.post(`${CONFIG.baseUrl}${path}`, { headers, data: payload });
    expect(res.status()).toBe(403);
  });

  test('should return 401 when signature is invalid', async ({ request }) => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    const path = endpoints.transactions.utxoTransfer(testData.vaults.testVaultId);
    const payload = payloads.transactions.utxoTransfer({
      assetId: testData.assets.bitcoin.assetId, feePriority: 'standard', note: 'n',
      recipients: [{ address: 'y', amount: '0.00001' }], senders: [{ utxoId: 'x' }],
    });
    const headers = generateHeaders('POST', path, payload);
    headers['x-api-sign'] = 'invalid-signature';
    const res = await request.post(`${CONFIG.baseUrl}${path}`, { headers, data: payload });
    const resBody = await res.json();
    expect(res.status()).toBe(401);
    expect(resBody.error.code).toBe('invalid_api_sign');
  });

});
