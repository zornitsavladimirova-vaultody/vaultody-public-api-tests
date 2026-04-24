const { defineConfig } = require('@playwright/test');

module.exports = defineConfig({
  testDir: './tests',
  timeout: 60000,
  use: {
    extraHTTPHeaders: {},
  },
  projects: [
    {
      name: 'api',
      use: {},
    }
  ],
});

