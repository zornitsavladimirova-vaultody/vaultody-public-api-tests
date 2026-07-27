// Request-body builders for the public API.
// Every public write endpoint uses the { data: { item: { ... } } } envelope.
// Builders accept an object and drop `undefined` fields, so negative tests can
// omit a required field simply by not passing it.
//
// NOTE: enum values in the public request body are LOWERCASE
// (feePriority: slow|standard|fast, prepareStrategy: minimize_dust|optimize_size,
//  method: approve|transfer-from) even though the internal proto enum is upper-case.

const wrap = (item) => ({ data: { item } });

function clean(obj) {
  const out = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value !== undefined) out[key] = value;
  }
  return out;
}

const payloads = {
  // ── Vault Accounts ──────────────────────────────────────────────────────────
  vaultAccounts: {
    create: (name) => wrap({ color: '#00C7E6', isHiddenInDashboard: false, name }),
    update: ({ name, color, isHiddenInDashboard, isFavorityInDashboard } = {}) =>
      wrap(clean({ name, color, isHiddenInDashboard, isFavorityInDashboard })),
  },

  // ── Assets & Addresses ───────────────────────────────────────────────────────
  assetsAndAddresses: {
    // required: assetId | optional: address, label
    addAsset: ({ assetId, address, label } = {}) => wrap(clean({ assetId, address, label })),
    // required (BODY): label, vaultAccountId  (blockchain/network/vaultId are PATH)
    generateDepositAddress: ({ label, vaultAccountId } = {}) => wrap(clean({ label, vaultAccountId })),
    // required (BODY): address  (blockchain/network are PATH)
    validateAddress: (address) => wrap(clean({ address })),
    // required: resource (bandwidth|energy), type (freeze|unfreeze|withdraw_resource|delegate|undelegate)
    // optional: amount, toAddress, note, lock, lockPeriod  (blockchain/network/fromAddress/vaultId are PATH)
    tronResourceManagement: ({ resource, type, amount, toAddress, note, lock, lockPeriod } = {}) =>
      wrap(clean({ resource, type, amount, toAddress, note, lock, lockPeriod })),
  },

  // ── Transactions ────────────────────────────────────────────────────────────
  transactions: {
    // required: amount, assetId, fromAddress, toAddress, note, vaultAccountId | optional: feePriority, gross, maxFee
    singleTransfer: ({ amount, assetId, fromAddress, toAddress, note, vaultAccountId, feePriority = 'standard', gross, maxFee } = {}) =>
      wrap(clean({ amount, assetId, fromAddress, toAddress, note, vaultAccountId, feePriority, gross, maxFee })),

    // required: assetId, feePriority, prepareStrategy, note, vaultAccountId, recipients[{address, amount}] | optional: gross, maxFee
    multipleTransfer: ({ assetId, recipients, note, vaultAccountId, feePriority = 'standard', prepareStrategy = 'optimize_size', gross, maxFee } = {}) =>
      wrap(clean({ assetId, recipients, note, vaultAccountId, feePriority, prepareStrategy, gross, maxFee })),

    // required: amount, assetId, feePayer, fromAddress, note, toAddress, vaultAccountId | optional: feePriority, maxFee
    gasSponsorship: ({ amount, assetId, feePayer, fromAddress, toAddress, note, vaultAccountId, feePriority = 'standard', maxFee } = {}) =>
      wrap(clean({ amount, assetId, feePayer, fromAddress, toAddress, note, vaultAccountId, feePriority, maxFee })),

    // required: feePayer{address, assetId}, fromAddress, note, recipients[{address, amount, assetId}] | optional: vaultAccountId, feePriority
    batch: ({ feePayer, fromAddress, note, vaultAccountId, recipients, feePriority = 'standard' } = {}) =>
      wrap(clean({ feePayer, fromAddress, note, vaultAccountId, recipients, feePriority })),

    // required: transactionType, vaultAccountId | many optional fields depending on transactionType
    approximateFee: ({ transactionType, vaultAccountId, assetId, fromAddress, toAddress, amount, feePriority, recipients, feePayer, feePayerAssetId, method, prepareStrategy } = {}) =>
      wrap(clean({ transactionType, vaultAccountId, assetId, fromAddress, toAddress, amount, feePriority, recipients, feePayer, feePayerAssetId, method, prepareStrategy })),

    // required: assetId, feePayer, fromAddress, method (approve|transfer-from), note | optional: toAddress, amount, vaultAccountId, maxFee
    contractInteraction: ({ assetId, feePayer, fromAddress, method, note, toAddress, amount, vaultAccountId, maxFee } = {}) =>
      wrap(clean({ assetId, feePayer, fromAddress, method, note, toAddress, amount, vaultAccountId, maxFee })),

    // required: assetId, feePriority, note, recipients[{address, amount}], senders[{utxoId}] | optional: feePayer, changeData, gross, maxFee
    utxoTransfer: ({ assetId, feePriority = 'standard', note, recipients, senders, feePayer, changeData, gross, maxFee } = {}) =>
      wrap(clean({ assetId, feePriority, note, recipients, senders, feePayer, changeData, gross, maxFee })),

    // same shape as utxoTransfer (validation-only, non-destructive)
    utxoTransferValidate: ({ assetId, feePriority = 'standard', note, recipients, senders, feePayer, changeData, gross, maxFee } = {}) =>
      wrap(clean({ assetId, feePriority, note, recipients, senders, feePayer, changeData, gross, maxFee })),
  },
};

module.exports = payloads;
