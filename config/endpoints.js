const endpoints = {
  vaults: {
    listTest: '/vaults/test',
    listMain: '/vaults/main',
    listByAssetId: (assetId, blockchain, networkType) => `/assets/${assetId}/${blockchain}/vaults/${networkType}`,
    listAssetsByVault: (vaultId) => `/vaults/${vaultId}/assets`,
    listTransactionsByVault: (vaultId) => `/vaults/${vaultId}/transactions`,
  },
  vaultAccounts: {
    create: (vaultId) => `/vaults/${vaultId}/vault-account`,
    list: (vaultId) => `/vaults/${vaultId}/vault-accounts`,
    getById: (vaultId, vaultAccountId) => `/vaults/${vaultId}/vault-accounts/${vaultAccountId}`,
    update: (vaultId, vaultAccountId) => `/vaults/${vaultId}/vault-accounts/${vaultAccountId}`,
  },
  assets: {
    listSupported: '/assets',
    addToAddress: (id) => `/addresses/${id}/assets`,
    generateDepositAddress: '/addresses',
    validate: '/addresses/validate',
  },
  transactions: {
    createSingleTransfer: '/transactions/single',
    getDetails: (id) => `/transactions/${id}`,
  }
};

module.exports = endpoints;