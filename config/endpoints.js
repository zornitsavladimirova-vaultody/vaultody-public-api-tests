// Endpoints grouped to match the live Vaultody REST API documentation sections:
// Vaults | Vault Accounts | Assets & Addresses | Transactions
// https://developers.vaultody.com/ (REST APIs)

const endpoints = {
  // ── Vaults ────────────────────────────────────────────────────────────────
  vaults: {
    listTest: '/vaults/test',
    listMain: '/vaults/main',
    listByAssetId: (assetId, blockchain, networkType) => `/assets/${assetId}/${blockchain}/vaults/${networkType}`,
    listAssetsByVault: (vaultId) => `/vaults/${vaultId}/assets`,
    listTransactionsByVault: (vaultId) => `/vaults/${vaultId}/transactions`,
  },

  // ── Vault Accounts ──────────────────────────────────────────────────────────
  vaultAccounts: {
    create: (vaultId) => `/vaults/${vaultId}/vault-account`,
    list: (vaultId) => `/vaults/${vaultId}/vault-accounts/details`,
    getById: (vaultId, vaultAccountId) => `/vaults/${vaultId}/vault-accounts/${vaultAccountId}/details`,
    update: (vaultId, vaultAccountId) => `/vaults/${vaultId}/vault-accounts/${vaultAccountId}/edit`,
    listAssets: (vaultId, vaultAccountId) => `/vaults/${vaultId}/vault-accounts/${vaultAccountId}/list-assets`,
    listTransactions: (vaultId, vaultAccountId) => `/vaults/${vaultId}/vault-accounts/${vaultAccountId}/transactions`,
  },

  // ── Assets & Addresses ───────────────────────────────────────────────────────
  assetsAndAddresses: {
    listSupported: '/supported-assets',
    addAsset: (vaultId, vaultAccountId) => `/vaults/${vaultId}/vault-accounts/${vaultAccountId}/add-asset`,
    generateDepositAddress: (vaultId, blockchain, network) => `/vaults/${vaultId}/${blockchain}/${network}/addresses`,
    validateAddress: (blockchain, network) => `/info/${blockchain}/${network}/addresses/validate`,
    listAddresses: (vaultId, vaultAccountId) => `/vaults/${vaultId}/vault-accounts/${vaultAccountId}/list-addresses`,
    getAddressBalance: (vaultId, address) => `/vaults/${vaultId}/addresses/${address}/balance`,
    tronResourceOverview: (vaultId, blockchain, network, address) => `/vaults/${vaultId}/${blockchain}/${network}/${address}/overview`,
    tronResourceManagement: (vaultId, blockchain, network, fromAddress) => `/vaults/${vaultId}/${blockchain}/${network}/addresses/${fromAddress}/manage-resource`,
    encodeXrpAddress: (network, classicAddress, addressTag) => `/utils/xrp/${network}/addresses/encode/${classicAddress}/${addressTag}`,
    decodeXrpAddress: (network, xAddress) => `/utils/xrp/${network}/addresses/decode/${xAddress}`,
  },

  // ── Transactions ────────────────────────────────────────────────────────────
  transactions: {
    singleTransfer: (vaultId) => `/vaults/${vaultId}/transaction-requests/single-transfer`,
    multipleTransfer: (vaultId) => `/vaults/${vaultId}/transaction-requests/multiple-transfer`,
    gasSponsorship: (vaultId) => `/vaults/${vaultId}/transaction-requests/gas-sponsorship-transfer`,
    batch: (vaultId) => `/vaults/${vaultId}/transaction-requests/batch`,
    getTransactionDetails: (vaultId, blockchain, transactionId) => `/vaults/${vaultId}/${blockchain}/transactions/${transactionId}`,
    approximateFee: (vaultId) => `/vaults/${vaultId}/approximate-fee`,
    contractInteraction: (vaultId) => `/vaults/${vaultId}/transaction-requests/contract-interaction`,
    listUtxos: (vaultId) => `/vaults/${vaultId}/utxos`,
    utxoTransferValidate: (vaultId) => `/vaults/${vaultId}/transaction-requests/utxo-transfer/validate`,
    utxoTransfer: (vaultId) => `/vaults/${vaultId}/transaction-requests/utxo-transfer`,
  },
};

module.exports = endpoints;
