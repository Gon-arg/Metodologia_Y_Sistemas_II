const { defineConfig } = require('@playwright/test');

module.exports = defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  retries: 0,
  reporter: 'list',

  use: {
    baseURL: 'http://localhost:8081',
    browserName: 'chromium',
    headless: true,
    trace: 'retain-on-failure',
  },
});
