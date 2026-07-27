const { test, expect } = require('@playwright/test');
const { generateHeaders, CONFIG } = require('../../auth/auth.js');
const endpoints = require('../../config/endpoints.js');
const payloads = require('../../config/payloads.js');
const testData = require('../../config/test-data.js');

// Validation-only (non-destructive), but needs a real UTXO + recipient to validate.
const hasData = Boolean(testData.testnet.utxoId && testData.testnet.toAddress);

test.describe('Transactions API - POST /vaults/{vaultId}/transaction-requests/utxo-transfer/validate - positive', () => {

  test('should validate a well-formed UTXO transfer', async ({ request }) => {
    test.skip(!hasData, 'Set testData.testnet.{utxoId,toAddress} to run UTXO transfer validation');
    await new Promise(resolve => setTimeout(resolve, 1000));
    const path = endpoints.transactions.utxoTransferValidate(testData.vaults.testVaultId);
    const payload = payloads.transactions.utxoTransferValidate({
      assetId: testData.assets.bitcoin.assetId,
      feePriority: 'standard',
      note: 'pw-utxo-validate',
      recipients: [{ address: testData.testnet.toAddress, amount: '0.00001' }],
      senders: [{ utxoId: testData.testnet.utxoId }],
    });
    const headers = generateHeaders('POST', path, payload);
    const res = await request.post(`${CONFIG.baseUrl}${path}`, { headers, data: payload });
    const body = await res.json();
    expect(res.status()).toBe(200);
    expect(body).toHaveProperty('data');
  });

});

test.describe('Transactions API - POST .../utxo-transfer/validate - negative tests', () => {

  test('should return 400/409 when required recipients/senders are missing', async ({ request }) => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    const path = endpoints.transactions.utxoTransferValidate(testData.vaults.testVaultId);
    const payload = payloads.transactions.utxoTransferValidate({
      assetId: testData.assets.bitcoin.assetId,
      feePriority: 'standard',
      note: 'pw-utxo-validate-missing',
    });
    const headers = generateHeaders('POST', path, payload);
    const res = await request.post(`${CONFIG.baseUrl}${path}`, { headers, data: payload });
    expect([400, 409, 422]).toContain(res.status());
  });

  test('should return 403 when vaultId does not belong to the API key', async ({ request }) => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    const path = endpoints.transactions.utxoTransferValidate('000000000000000000000000');
    const payload = payloads.transactions.utxoTransferValidate({
      assetId: testData.assets.bitcoin.assetId,
      feePriority: 'standard',
      note: 'pw-utxo-validate',
      recipients: [{ address: 'x', amount: '0.00001' }],
      senders: [{ utxoId: 'x' }],
    });
    const headers = generateHeaders('POST', path, payload);
    const res = await request.post(`${CONFIG.baseUrl}${path}`, { headers, data: payload });
    expect(res.status()).toBe(403);
  });

  test('should return 401 when signature is invalid', async ({ request }) => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    const path = endpoints.transactions.utxoTransferValidate(testData.vaults.testVaultId);
    const payload = payloads.transactions.utxoTransferValidate({
      assetId: testData.assets.bitcoin.assetId,
      feePriority: 'standard',
      note: 'pw-utxo-validate',
      recipients: [{ address: 'x', amount: '0.00001' }],
      senders: [{ utxoId: 'x' }],
    });
    const headers = generateHeaders('POST', path, payload);
    headers['x-api-sign'] = 'invalid-signature';
    const res = await request.post(`${CONFIG.baseUrl}${path}`, { headers, data: payload });
    const resBody = await res.json();
    expect(res.status()).toBe(401);
    expect(resBody.error.code).toBe('invalid_api_sign');
  });

});
