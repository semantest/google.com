import { defineConfig, devices } from '@playwright/test';
import path from 'path';

/**
 * Playwright configuration for Google Images Download E2E tests
 */
export default defineConfig({
  testDir: './tests',
  
  // Test timeout
  timeout: 30 * 1000,
  
  // Test execution settings
  fullyParallel: false, // Run tests sequentially for extension testing
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1, // Single worker for extension testing
  
  // Reporter configuration
  reporter: [
    ['html', { outputFolder: 'test-results/html' }],
    ['json', { outputFile: 'test-results/results.json' }],
    ['junit', { outputFile: 'test-results/junit.xml' }],
    ['list']
  ],
  
  // Global test configuration
  use: {
    // Base URL for tests
    baseURL: 'https://images.google.com',
    
    // Trace and screenshot settings
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    
    // Viewport
    viewport: { width: 1280, height: 800 },
    
    // Action timeout
    actionTimeout: 10 * 1000,
    
    // Navigation timeout
    navigationTimeout: 30 * 1000,
  },

  // Project configurations
  projects: [
    {
      name: 'chromium-with-extension',
      use: {
        ...devices['Desktop Chrome'],
        // Extension loading configuration
        launchOptions: {
          args: [
            `--disable-extensions-except=${path.join(__dirname, '../extension.chrome/build')}`,
            `--load-extension=${path.join(__dirname, '../extension.chrome/build')}`,
            '--no-sandbox',
            '--disable-setuid-sandbox',
          ],
          headless: false, // Extensions require headed mode
        },
        // Custom context options
        contextOptions: {
          // Accept downloads
          acceptDownloads: true,
          // Permissions
          permissions: ['notifications', 'clipboard-read', 'clipboard-write'],
        }
      },
    },
    
    {
      name: 'chromium-no-extension',
      use: {
        ...devices['Desktop Chrome'],
        // For tests that don't require the extension
        headless: true,
      },
    },
  ],

  // Output folder for test artifacts
  outputDir: 'test-results/artifacts',

  // Global setup and teardown
  globalSetup: require.resolve('./tests/global-setup.ts'),
  globalTeardown: require.resolve('./tests/global-teardown.ts'),
});