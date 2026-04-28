const payloads = {
  vaultAccounts: {
    create: (name) => ({
      data: {
        item: {
          color: '#00C7E6',
          isHiddenInDashboard: false,
          name: name
        }
      }
    })
  }
};

module.exports = payloads;