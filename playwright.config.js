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
  // Пауза между тестовете за да не hit-ваме rate limit
  reporter: 'list',
  workers: 1,
});

