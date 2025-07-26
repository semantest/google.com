#!/bin/bash

echo "🚨 DEVOPS EMERGENCY TEST DEPLOYMENT!"
echo "Lost contact with Chromium tester - executing contingency!"
echo ""

# OPTION 1: Immediate Puppeteer Test
cat > emergency-consent-test.js << 'EOF'
const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

console.log('🚨 EMERGENCY CONSENT TEST STARTING...');
console.log('DevOps taking control of testing!');

(async () => {
  try {
    // Launch Chrome with extension
    const browser = await puppeteer.launch({
      headless: false, // Set true for headless
      args: [
        '--disable-extensions-except=' + path.resolve('./extension.chrome/dist'),
        '--load-extension=' + path.resolve('./extension.chrome/dist'),
        '--no-sandbox'
      ]
    });

    console.log('✅ Chrome launched with extension');
    
    // Wait for extension load
    await new Promise(r => setTimeout(r, 2000));
    
    // Find extension
    const targets = await browser.targets();
    const extTarget = targets.find(t => t.type() === 'service_worker');
    
    if (!extTarget) {
      console.error('❌ FAIL: Extension did not load!');
      process.exit(1);
    }
    
    const extId = extTarget.url().match(/chrome-extension:\/\/([^\/]+)/)[1];
    console.log('✅ Extension ID:', extId);
    
    // Test popup for consent
    const page = await browser.newPage();
    await page.goto(`chrome-extension://${extId}/src/popup.html`);
    
    // Check for consent elements
    const hasConsent = await page.evaluate(() => {
      // Check multiple possible selectors
      const selectors = [
        '[data-consent]',
        '#telemetry-consent',
        '.consent-popup',
        '[class*="consent"]',
        '[id*="consent"]',
        'div:contains("consent")',
        'div:contains("telemetry")',
        'div:contains("privacy")'
      ];
      
      for (const sel of selectors) {
        try {
          if (document.querySelector(sel)) return true;
        } catch (e) {}
      }
      return false;
    });
    
    // Screenshot
    await page.screenshot({ path: 'EMERGENCY-consent-test.png' });
    
    console.log('');
    console.log('🎯 EMERGENCY TEST RESULTS:');
    console.log('========================');
    console.log(`Consent Popup: ${hasConsent ? '✅ FOUND!' : '❌ NOT FOUND'}`);
    console.log('Screenshot: EMERGENCY-consent-test.png');
    console.log('');
    
    if (hasConsent) {
      console.log('🚀 CONSENT TEST PASSED! READY FOR LAUNCH!');
    } else {
      console.log('⚠️  WARNING: Consent popup not detected');
      console.log('This may be a false negative - check screenshot');
    }
    
    await browser.close();
    process.exit(hasConsent ? 0 : 1);
    
  } catch (error) {
    console.error('❌ Test error:', error.message);
    process.exit(1);
  }
})();
EOF

# OPTION 2: Quick Docker deployment
echo "🐳 Docker Chrome option ready:"
echo "docker run -p 7900:7900 -v \$(pwd)/extension.chrome/dist:/ext selenium/standalone-chrome"
echo ""

# OPTION 3: Direct execution
echo "🚀 EXECUTING EMERGENCY TEST..."
echo ""

# Check if puppeteer installed
if [ ! -d "node_modules/puppeteer" ]; then
  echo "📦 Installing Puppeteer..."
  npm install puppeteer
fi

# Run the test
echo "🧪 Running consent popup test..."
node emergency-consent-test.js

echo ""
echo "📊 TEST COMPLETE!"
echo "Check results above and screenshot: EMERGENCY-consent-test.png"