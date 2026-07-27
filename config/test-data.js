const testData = {
    vaults: {
        testVaultId: '6a6738999787b70007a87788', // Mobile test only 2 - backuped: true
        createVaultAccountVaultId: '69e5ed7c859b6c00073fa8ba', // Mobile 2 -  backuped: true
        // Mobile 3 (69e5ef5a859b6c00073fa8bb) used to sit here but is now backuped: true,
        // which made the "403 when vault is not backuped" test get a 201 instead.
        notBackupedVaultId: '69e5ef88859b6c00073fa8bc', // Mobile 4 - backuped: false
    },
    vaultAccounts: {
        testVaultAccountId: '6a6738999787b70007a87788', // default vault account shares the vault's id
    },
    assets: {
        bitcoin: {
            assetId: '69946158b588731a395513f7',
            blockchain: 'bitcoin',
        },
        ethereum: {
            assetId: '69946158b588731a39551409',
            blockchain: 'ethereum',
        },
        ethereumTokenUsdc: {
            assetId: '69946158b588731a3955142d',
            blockchain: 'ethereum',
        },
    },

    // XRP encode/decode are pure BlockchainUtils helpers (deterministic, no funds needed).
    // The decode test chains off the encode output, so xAddress is not hardcoded here.
    xrp: {
        network: 'testnet',
        classicAddress: 'rHb9CJAWyB4rj91VRWn96DkukG4bwdtyTh',
        addressTag: '12345',
    },

    // Tron read/overview needs a real Tron address in the vault; leave blank to auto-skip.
    tron: {
        network: 'nile',
        blockchain: 'tron',
        vaultId: '',
        overviewAddress: '',
        fromAddress: '',
        toAddress: '',
    },

    // Positive cases for DESTRUCTIVE endpoints (create real transaction-requests) need real,
    // funded QA testnet values. They only run when RUN_DESTRUCTIVE=true; leave blank otherwise.
    testnet: {
        fromAddress: '',
        toAddress: '',
        feePayerAddress: '',
        feePayerAssetId: '',
        utxoId: '',
    },
};

module.exports = testData;
