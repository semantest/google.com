import { chromium } from '@playwright/test';
import fs from 'fs';
import path from 'path';

/**
 * Global setup for E2E tests
 * Prepares test environment before running tests
 */
async function globalSetup() {
  console.log('🚀 Starting global test setup...');
  
  // Create test directories
  const dirs = [
    'test-results',
    'test-results/html',
    'test-results/artifacts',
    'tests/downloads'
  ];
  
  dirs.forEach(dir => {
    const fullPath = path.join(__dirname, '..', dir);
    if (!fs.existsSync(fullPath)) {
      fs.mkdirSync(fullPath, { recursive: true });
      console.log(`📁 Created directory: ${dir}`);
    }
  });
  
  // Verify extension exists
  const extensionPath = path.join(__dirname, '../../extension.chrome/build');
  if (!fs.existsSync(extensionPath)) {
    console.error('❌ Chrome extension not found at:', extensionPath);
    console.error('Please build the extension first with: npm run build:extension');
    process.exit(1);
  }
  
  // Check manifest.json
  const manifestPath = path.join(extensionPath, 'manifest.json');
  if (!fs.existsSync(manifestPath)) {
    console.error('❌ Extension manifest.json not found');
    process.exit(1);
  }
  
  try {
    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    console.log(`✅ Extension found: ${manifest.name} v${manifest.version}`);
    
    // Verify required permissions
    const requiredPermissions = ['downloads', 'storage', 'tabs'];
    const missingPermissions = requiredPermissions.filter(
      p => !manifest.permissions?.includes(p)
    );
    
    if (missingPermissions.length > 0) {
      console.warn(`⚠️  Missing permissions: ${missingPermissions.join(', ')}`);
    }
  } catch (error) {
    console.error('❌ Failed to read manifest.json:', error);
    process.exit(1);
  }
  
  // Test Chrome launch with extension
  console.log('🧪 Testing Chrome launch with extension...');
  try {
    const browser = await chromium.launch({
      headless: false,
      args: [
        `--disable-extensions-except=${extensionPath}`,
        `--load-extension=${extensionPath}`,
        '--no-sandbox'
      ]
    });
    
    const context = await browser.newContext();
    const page = await context.newPage();
    
    // Quick test
    await page.goto('https://images.google.com', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1000);
    
    // Check if extension loaded
    const extensionLoaded = await page.evaluate(() => {
      return !!(window as any).chrome?.runtime?.id;
    });
    
    if (extensionLoaded) {
      console.log('✅ Extension loaded successfully');
    } else {
      console.warn('⚠️  Extension may not be loaded properly');
    }
    
    await browser.close();
  } catch (error) {
    console.error('❌ Failed to launch Chrome with extension:', error);
    console.log('Continuing anyway - some tests may be skipped');
  }
  
  console.log('✅ Global setup completed\n');
}

export default globalSetup;