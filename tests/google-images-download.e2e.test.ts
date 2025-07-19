import { test, expect, Page, BrowserContext } from '@playwright/test';
import { EventDrivenWebBuddyClient } from '../src/google-buddy-client';
import path from 'path';
import fs from 'fs';

/**
 * E2E Test Suite for Google Images Download Feature
 * 
 * Tests the complete flow from searching images to downloading them locally
 * using the Web-Buddy Chrome extension.
 */

// Test configuration
const TEST_TIMEOUT = 30000; // 30 seconds per test
const DOWNLOAD_TIMEOUT = 10000; // 10 seconds for download completion
const EXTENSION_PATH = path.join(__dirname, '../../../extension.chrome/build');

// Test data
const TEST_SEARCHES = {
  basic: 'green house',
  special: 'café & restaurant',
  multiWord: 'beautiful mountain landscape',
  unicode: '日本 風景' // Japanese landscape
};

describe('Google Images Download Feature', () => {
  let page: Page;
  let context: BrowserContext;
  let downloadPath: string;
  let extensionId: string;

  beforeAll(async () => {
    // Setup download directory
    downloadPath = path.join(__dirname, 'downloads', Date.now().toString());
    fs.mkdirSync(downloadPath, { recursive: true });
  });

  beforeEach(async ({ browser }) => {
    // Load Chrome extension
    context = await browser.newContext({
      // Note: This requires running with chromium and proper extension loading
      // args: [`--load-extension=${EXTENSION_PATH}`, '--no-sandbox']
    });
    
    page = await context.newPage();
    
    // Mock extension ID for testing (in real scenario, get from loaded extension)
    extensionId = 'mock-extension-id';
  });

  afterEach(async () => {
    await context?.close();
  });

  afterAll(async () => {
    // Cleanup download directory
    fs.rmSync(downloadPath, { recursive: true, force: true });
  });

  describe('Search Functionality', () => {
    test('TC-001: Basic search for "green house"', async () => {
      await page.goto('https://images.google.com');
      
      // Handle cookie consent if present
      const acceptButton = page.locator('button:has-text("Accept all")').first();
      if (await acceptButton.isVisible({ timeout: 3000 })) {
        await acceptButton.click();
      }
      
      // Perform search
      const searchInput = page.locator('textarea[name="q"], input[name="q"]').first();
      await searchInput.fill(TEST_SEARCHES.basic);
      await searchInput.press('Enter');
      
      // Verify results loaded
      await page.waitForSelector('img[data-src], img[src*="gstatic.com"]', { 
        timeout: 10000 
      });
      
      // Check that images are displayed
      const images = await page.locator('img[data-src], img[src*="gstatic.com"]').count();
      expect(images).toBeGreaterThan(0);
      
      // Verify search query in URL
      expect(page.url()).toContain('q=green+house');
    });

    test('TC-002: Search with special characters', async () => {
      await page.goto('https://images.google.com');
      
      const searchInput = page.locator('textarea[name="q"], input[name="q"]').first();
      await searchInput.fill(TEST_SEARCHES.special);
      await searchInput.press('Enter');
      
      await page.waitForSelector('img[data-src], img[src*="gstatic.com"]');
      
      // Verify URL encoding
      expect(page.url()).toContain('caf%C3%A9');
      expect(page.url()).toContain('restaurant');
    });

    test('TC-003: Multi-word search', async () => {
      await page.goto('https://images.google.com');
      
      const searchInput = page.locator('textarea[name="q"], input[name="q"]').first();
      await searchInput.fill(TEST_SEARCHES.multiWord);
      await searchInput.press('Enter');
      
      await page.waitForSelector('img[data-src], img[src*="gstatic.com"]');
      
      const images = await page.locator('img[data-src], img[src*="gstatic.com"]').count();
      expect(images).toBeGreaterThan(0);
    });
  });

  describe('Download Button Integration', () => {
    test('TC-004: Download button visibility on hover', async () => {
      // This test requires the extension to be loaded
      test.skip(!extensionId, 'Extension not loaded');
      
      await page.goto('https://images.google.com');
      await page.locator('textarea[name="q"], input[name="q"]').first().fill(TEST_SEARCHES.basic);
      await page.keyboard.press('Enter');
      
      await page.waitForSelector('img[data-src], img[src*="gstatic.com"]');
      
      // Hover over first image
      const firstImage = page.locator('img[data-src], img[src*="gstatic.com"]').first();
      await firstImage.hover();
      
      // Check for download button (added by extension)
      const downloadButton = page.locator('.web-buddy-download-button').first();
      await expect(downloadButton).toBeVisible({ timeout: 5000 });
    });

    test('TC-006: Dynamic content loading', async () => {
      test.skip(!extensionId, 'Extension not loaded');
      
      await page.goto('https://images.google.com');
      await page.locator('textarea[name="q"], input[name="q"]').first().fill(TEST_SEARCHES.basic);
      await page.keyboard.press('Enter');
      
      // Initial image count
      const initialImages = await page.locator('img[data-src], img[src*="gstatic.com"]').count();
      
      // Scroll to bottom to trigger lazy loading
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      await page.waitForTimeout(2000);
      
      // Check new images loaded
      const afterScrollImages = await page.locator('img[data-src], img[src*="gstatic.com"]').count();
      expect(afterScrollImages).toBeGreaterThan(initialImages);
      
      // Verify download buttons on new images
      const downloadButtons = await page.locator('.web-buddy-download-button').count();
      expect(downloadButtons).toBeGreaterThan(0);
    });
  });

  describe('Download Functionality', () => {
    test('TC-007: Single image download', async () => {
      test.skip(!extensionId, 'Extension not loaded');
      
      // Setup download handling
      const downloadPromise = page.waitForEvent('download');
      
      await page.goto('https://images.google.com');
      await page.locator('textarea[name="q"], input[name="q"]').first().fill(TEST_SEARCHES.basic);
      await page.keyboard.press('Enter');
      
      await page.waitForSelector('img[data-src], img[src*="gstatic.com"]');
      
      // Click first download button
      const firstImage = page.locator('img[data-src], img[src*="gstatic.com"]').first();
      await firstImage.hover();
      await page.locator('.web-buddy-download-button').first().click();
      
      // Wait for download
      const download = await downloadPromise;
      const savedPath = path.join(downloadPath, download.suggestedFilename());
      await download.saveAs(savedPath);
      
      // Verify file exists
      expect(fs.existsSync(savedPath)).toBe(true);
      
      // Verify file size
      const stats = fs.statSync(savedPath);
      expect(stats.size).toBeGreaterThan(0);
    });

    test('TC-009: Filename generation', async () => {
      test.skip(!extensionId, 'Extension not loaded');
      
      const downloadPromise = page.waitForEvent('download');
      
      await page.goto('https://images.google.com');
      await page.locator('textarea[name="q"], input[name="q"]').first().fill(TEST_SEARCHES.basic);
      await page.keyboard.press('Enter');
      
      await page.waitForSelector('img[data-src], img[src*="gstatic.com"]');
      
      const firstImage = page.locator('img[data-src], img[src*="gstatic.com"]').first();
      await firstImage.hover();
      await page.locator('.web-buddy-download-button').first().click();
      
      const download = await downloadPromise;
      const filename = download.suggestedFilename();
      
      // Verify filename contains search context
      expect(filename.toLowerCase()).toContain('green');
      expect(filename).toMatch(/\.(jpg|jpeg|png|webp|gif)$/i);
    });
  });

  describe('Edge Cases', () => {
    test('TC-011: WebP image format', async () => {
      test.skip(!extensionId, 'Extension not loaded');
      
      // Search for images likely to be WebP
      await page.goto('https://images.google.com');
      await page.locator('textarea[name="q"], input[name="q"]').first().fill('modern web design');
      await page.keyboard.press('Enter');
      
      await page.waitForSelector('img[src*=".webp"], img[data-src*=".webp"]');
      
      const webpImage = page.locator('img[src*=".webp"], img[data-src*=".webp"]').first();
      await webpImage.hover();
      
      const downloadPromise = page.waitForEvent('download');
      await page.locator('.web-buddy-download-button').first().click();
      
      const download = await downloadPromise;
      expect(download.suggestedFilename()).toMatch(/\.webp$/i);
    });

    test('TC-018: Rapid click prevention', async () => {
      test.skip(!extensionId, 'Extension not loaded');
      
      await page.goto('https://images.google.com');
      await page.locator('textarea[name="q"], input[name="q"]').first().fill(TEST_SEARCHES.basic);
      await page.keyboard.press('Enter');
      
      await page.waitForSelector('img[data-src], img[src*="gstatic.com"]');
      
      const firstImage = page.locator('img[data-src], img[src*="gstatic.com"]').first();
      await firstImage.hover();
      
      const downloadButton = page.locator('.web-buddy-download-button').first();
      
      // Click rapidly 5 times
      const downloads: any[] = [];
      page.on('download', (download) => downloads.push(download));
      
      for (let i = 0; i < 5; i++) {
        await downloadButton.click({ force: true });
      }
      
      await page.waitForTimeout(2000);
      
      // Should only trigger one download
      expect(downloads.length).toBe(1);
    });
  });

  describe('Error Handling', () => {
    test('TC-021: Network offline handling', async () => {
      test.skip(!extensionId, 'Extension not loaded');
      
      await page.goto('https://images.google.com');
      await page.locator('textarea[name="q"], input[name="q"]').first().fill(TEST_SEARCHES.basic);
      await page.keyboard.press('Enter');
      
      await page.waitForSelector('img[data-src], img[src*="gstatic.com"]');
      
      // Go offline
      await context.setOffline(true);
      
      const firstImage = page.locator('img[data-src], img[src*="gstatic.com"]').first();
      await firstImage.hover();
      await page.locator('.web-buddy-download-button').first().click();
      
      // Check for error message
      const errorMessage = page.locator('.web-buddy-error-message, [role="alert"]');
      await expect(errorMessage).toBeVisible({ timeout: 5000 });
      await expect(errorMessage).toContainText(/network|offline|connection/i);
    });

    test('TC-026: Broken image link', async () => {
      test.skip(!extensionId, 'Extension not loaded');
      
      // Navigate to a page with a broken image
      await page.goto('https://images.google.com/404-broken-image.jpg', { 
        waitUntil: 'domcontentloaded' 
      });
      
      // Extension should handle 404 gracefully
      const errorElement = page.locator('.web-buddy-error, [data-error]');
      if (await errorElement.isVisible({ timeout: 5000 })) {
        await expect(errorElement).toContainText(/not found|404|error/i);
      }
    });
  });

  describe('Performance', () => {
    test('TC-029: Button render performance', async () => {
      test.skip(!extensionId, 'Extension not loaded');
      
      await page.goto('https://images.google.com');
      await page.locator('textarea[name="q"], input[name="q"]').first().fill(TEST_SEARCHES.basic);
      await page.keyboard.press('Enter');
      
      const startTime = Date.now();
      await page.waitForSelector('.web-buddy-download-button', { timeout: 1000 });
      const renderTime = Date.now() - startTime;
      
      // Buttons should appear within 100ms of page load
      expect(renderTime).toBeLessThan(100);
    });

    test('TC-030: Download initiation speed', async () => {
      test.skip(!extensionId, 'Extension not loaded');
      
      await page.goto('https://images.google.com');
      await page.locator('textarea[name="q"], input[name="q"]').first().fill(TEST_SEARCHES.basic);
      await page.keyboard.press('Enter');
      
      await page.waitForSelector('img[data-src], img[src*="gstatic.com"]');
      
      const firstImage = page.locator('img[data-src], img[src*="gstatic.com"]').first();
      await firstImage.hover();
      
      const startTime = Date.now();
      const downloadPromise = page.waitForEvent('download', { timeout: 500 });
      await page.locator('.web-buddy-download-button').first().click();
      
      try {
        await downloadPromise;
        const initiationTime = Date.now() - startTime;
        expect(initiationTime).toBeLessThan(500);
      } catch (error) {
        // Download didn't start within 500ms
        expect(error).toBeUndefined();
      }
    });
  });
});

/**
 * Helper function to check if extension is properly loaded
 */
async function verifyExtensionLoaded(page: Page): Promise<boolean> {
  return await page.evaluate(() => {
    return !!(window as any).webBuddy || document.querySelector('.web-buddy-download-button');
  });
}

/**
 * Helper to wait for download with timeout
 */
async function waitForDownload(page: Page, timeout = DOWNLOAD_TIMEOUT): Promise<any> {
  return Promise.race([
    page.waitForEvent('download'),
    new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Download timeout')), timeout)
    )
  ]);
}