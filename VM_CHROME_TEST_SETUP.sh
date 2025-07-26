#!/bin/bash

# EMERGENCY VM Setup for Chrome Extension Testing
echo "🚨 EMERGENCY: Setting up VM with Chrome for testing..."

# Option 1: Docker with Chrome (Fastest)
cat > docker-compose.chrome-test.yml << 'EOF'
version: '3.8'
services:
  chrome-test:
    image: selenium/standalone-chrome:latest
    ports:
      - "4444:4444"
      - "7900:7900"  # noVNC port for browser access
    environment:
      - SE_NODE_MAX_SESSIONS=1
      - SE_NODE_SESSION_TIMEOUT=300
      - VNC_NO_PASSWORD=1
    volumes:
      - ./extension.chrome/dist:/extension
    shm_size: '2gb'
EOF

# Option 2: Quick cloud VM setup
cat > setup-test-vm.sh << 'EOF'
#!/bin/bash
# Quick Chrome test VM on cloud provider

# For AWS EC2
aws ec2 run-instances \
  --image-id ami-0c55b159cbfafe1f0 \
  --instance-type t2.micro \
  --key-name devops-test \
  --user-data '#!/bin/bash
    apt-get update
    apt-get install -y wget gnupg
    wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add -
    echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list
    apt-get update
    apt-get install -y google-chrome-stable xvfb
    # Install VNC for remote access
    apt-get install -y x11vnc xfce4
  '

# For local VirtualBox
echo "Alternative: VirtualBox with Ubuntu + Chrome"
echo "1. Download Ubuntu ISO"
echo "2. Create VM with 2GB RAM"
echo "3. Install Chrome"
echo "4. Test extension"
EOF

# Option 3: Headless Chrome testing (No UI but can verify basics)
cat > headless-chrome-test.js << 'EOF'
const puppeteer = require('puppeteer');
const path = require('path');

async function testExtension() {
  console.log('🧪 Starting headless Chrome test...');
  
  const browser = await puppeteer.launch({
    headless: false, // Set to false to see browser
    args: [
      `--disable-extensions-except=${path.resolve('./extension.chrome/dist')}`,
      `--load-extension=${path.resolve('./extension.chrome/dist')}`,
      '--no-sandbox'
    ]
  });

  const page = await browser.newPage();
  
  // Get extension ID
  const targets = await browser.targets();
  const extensionTarget = targets.find(target => target.type() === 'service_worker');
  const extensionId = extensionTarget.url().split('/')[2];
  
  console.log(`✅ Extension loaded with ID: ${extensionId}`);
  
  // Test popup
  const popupUrl = `chrome-extension://${extensionId}/src/popup.html`;
  await page.goto(popupUrl);
  
  // Check for consent dialog
  const consentExists = await page.evaluate(() => {
    return document.querySelector('[data-testid="telemetry-consent"]') !== null;
  });
  
  console.log(`📊 Telemetry consent popup: ${consentExists ? 'FOUND ✅' : 'NOT FOUND ❌'}`);
  
  // Take screenshot
  await page.screenshot({ path: 'consent-popup-test.png' });
  console.log('📸 Screenshot saved: consent-popup-test.png');
  
  await browser.close();
}

testExtension().catch(console.error);
EOF

echo "🚀 QUICK START OPTIONS:"
echo ""
echo "1. DOCKER (Fastest - 2 minutes):"
echo "   docker-compose -f docker-compose.chrome-test.yml up"
echo "   Browse to: http://localhost:7900 (password: secret)"
echo ""
echo "2. PUPPETEER TEST (Automated):"
echo "   npm install puppeteer"
echo "   node headless-chrome-test.js"
echo ""
echo "3. CLOUD VM (5 minutes):"
echo "   ./setup-test-vm.sh"
echo ""
echo "Choose fastest option for immediate testing!"