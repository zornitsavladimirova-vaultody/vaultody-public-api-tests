const endpoints = {
  vaults: {
    listTest: '/vaults/test',
    listMain: '/vaults/main',
    listByAssetId: (assetId, blockchain, networkType) => `/assets/${assetId}/${blockchain}/vaults/${networkType}`,
    listAssetsByVault: (vaultId) => `/vaults/${vaultId}/assets`,
  },
  vaultAccounts: {
    create: '/vault-accounts',
    list: '/vault-accounts',
    getById: (id) => `/vault-accounts/${id}`,
    update: (id) => `/vault-accounts/${id}`,
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