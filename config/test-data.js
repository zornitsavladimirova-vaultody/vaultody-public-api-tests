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
    // All TESTNET assets, taken from GET /supported-assets on QA-01 (2026-07-27). The suite runs
    // against test vaults, so the mainnet twin of each asset carries a DIFFERENT assetId and is
    // deliberately not listed here. `network` is the chain's own test-network name, needed by the
    // deposit-address and Tron endpoints; `assetUnit` is kept for readable test titles.
    // Naming: native coins are keyed by blockchain, tokens by `<blockchain>Token<Symbol>`.
    assets: {
        // ── Native coins (one per supported chain) ──────────────────────────────
        bitcoin: {
            assetId: '69946158b588731a395513f7',
            blockchain: 'bitcoin',
            network: 'testnet',
            assetUnit: 'BTC',
        },
        bitcoinCash: {
            assetId: '69946158b588731a395513f9',
            blockchain: 'bitcoin-cash',
            network: 'testnet',
            assetUnit: 'BCH',
        },
        litecoin: {
            assetId: '69946158b588731a395513fe',
            blockchain: 'litecoin',
            network: 'testnet',
            assetUnit: 'LTC',
        },
        dogecoin: {
            assetId: '69946158b588731a39551401',
            blockchain: 'dogecoin',
            network: 'testnet',
            assetUnit: 'DOGE',
        },
        dash: {
            assetId: '69946158b588731a39551407',
            blockchain: 'dash',
            network: 'testnet',
            assetUnit: 'DASH',
        },
        zcash: {
            assetId: '69946158b588731a3955141e',
            blockchain: 'zcash',
            network: 'testnet',
            assetUnit: 'ZEC',
        },
        xrp: {
            assetId: '69946158b588731a3955140f',
            blockchain: 'xrp',
            network: 'testnet',
            assetUnit: 'XRP',
        },
        ethereum: {
            assetId: '69946158b588731a39551409',
            blockchain: 'ethereum',
            network: 'sepolia',
            assetUnit: 'ETH',
        },
        ethereumClassic: {
            assetId: '69946158b588731a3955140c',
            blockchain: 'ethereum-classic',
            network: 'mordor',
            assetUnit: 'ETC',
        },
        // ETH is native on four chains and each one has its own assetId - they are NOT
        // interchangeable, so keep them keyed by chain.
        arbitrum: {
            assetId: '69946158b588731a39551412',
            blockchain: 'arbitrum',
            network: 'sepolia',
            assetUnit: 'ETH',
        },
        base: {
            assetId: '69946158b588731a395513fc',
            blockchain: 'base',
            network: 'sepolia',
            assetUnit: 'ETH',
        },
        optimism: {
            assetId: '69946158b588731a39551425',
            blockchain: 'optimism',
            network: 'sepolia',
            assetUnit: 'ETH',
        },
        polygon: {
            assetId: '69946158b588731a39551421',
            blockchain: 'polygon',
            network: 'amoy',
            assetUnit: 'MATIC',
        },
        binanceSmartChain: {
            assetId: '69946158b588731a39551414',
            blockchain: 'binance-smart-chain',
            network: 'testnet',
            assetUnit: 'BNB',
        },
        avalanche: {
            assetId: '69946158b588731a39551404',
            blockchain: 'avalanche',
            network: 'fuji',
            assetUnit: 'AVAX',
        },
        tron: {
            assetId: '69946158b588731a39551418',
            blockchain: 'tron',
            network: 'nile',
            assetUnit: 'TRX',
        },
        solana: {
            assetId: '69946158b588731a3955141c',
            blockchain: 'solana',
            network: 'devnet',
            assetUnit: 'SOL',
        },

        // ── Tokens ─────────────────────────────────────────────────────────────
        ethereumTokenUsdc: {
            assetId: '69946158b588731a3955142d',
            blockchain: 'ethereum',
            network: 'sepolia',
            assetUnit: 'USDC',
        },
        ethereumTokenUsdt: {
            assetId: '69946158b588731a39551427',
            blockchain: 'ethereum',
            network: 'sepolia',
            assetUnit: 'USDT',
        },
        ethereumTokenLink: {
            assetId: '69946158b588731a39551438',
            blockchain: 'ethereum',
            network: 'sepolia',
            assetUnit: 'LINK',
        },
        binanceSmartChainTokenUsdt: {
            assetId: '69946158b588731a39551428',
            blockchain: 'binance-smart-chain',
            network: 'testnet',
            assetUnit: 'USDT',
        },
        binanceSmartChainTokenUsdc: {
            assetId: '69946158b588731a39551431',
            blockchain: 'binance-smart-chain',
            network: 'testnet',
            assetUnit: 'USDC',
        },
        binanceSmartChainTokenBusd: {
            assetId: '69946158b588731a39551435',
            blockchain: 'binance-smart-chain',
            network: 'testnet',
            assetUnit: 'BUSD',
        },
        binanceSmartChainTokenLink: {
            assetId: '69946158b588731a3955143a',
            blockchain: 'binance-smart-chain',
            network: 'testnet',
            assetUnit: 'LINK',
        },
        tronTokenUsdt: {
            assetId: '69946158b588731a39551429',
            blockchain: 'tron',
            network: 'nile',
            assetUnit: 'USDT',
        },
        tronTokenJst: {
            assetId: '69946158b588731a39551436',
            blockchain: 'tron',
            network: 'nile',
            assetUnit: 'JST',
        },
        solanaTokenUsdc: {
            assetId: '69946158b588731a39551432',
            blockchain: 'solana',
            network: 'devnet',
            assetUnit: 'USDC',
        },
        polygonTokenLink: {
            assetId: '69946158b588731a3955143b',
            blockchain: 'polygon',
            network: 'amoy',
            assetUnit: 'LINK',
        },
        optimismTokenLink: {
            assetId: '69946158b588731a3955143c',
            blockchain: 'optimism',
            network: 'sepolia',
            assetUnit: 'LINK',
        },
        arbitrumTokenLink: {
            assetId: '69946158b588731a3955143d',
            blockchain: 'arbitrum',
            network: 'sepolia',
            assetUnit: 'LINK',
        },
        baseTokenLink: {
            assetId: '69946158b588731a3955143f',
            blockchain: 'base',
            network: 'sepolia',
            assetUnit: 'LINK',
        },
        avalancheTokenLink: {
            assetId: '69946158b588731a39551440',
            blockchain: 'avalanche',
            network: 'fuji',
            assetUnit: 'LINK',
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
