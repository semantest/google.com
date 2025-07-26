#!/bin/bash

echo "🚨 EMERGENCY: Deploying Chrome testing infrastructure..."

# SOLUTION 1: Docker with VNC (FASTEST - 30 seconds)
echo "=== SOLUTION 1: Docker Chrome with VNC ==="
cat > docker-chrome-emergency.sh << 'DOCKER_EOF'
#!/bin/bash
# ONE COMMAND TO RUN:
docker run -d \
  --name chrome-test-emergency \
  -p 7900:7900 \
  -p 4444:4444 \
  -v $(pwd)/extension.chrome/dist:/home/seluser/extension \
  --shm-size="2g" \
  selenium/standalone-chrome:latest

echo "✅ Chrome ready at: http://localhost:7900"
echo "🔑 Password: secret"
echo "📁 Extension at: /home/seluser/extension"
DOCKER_EOF

# SOLUTION 2: GitHub Actions Headless Test
echo "=== SOLUTION 2: GitHub Actions Chrome Test ==="
cat > .github/workflows/emergency-chrome-test.yml << 'GH_EOF'
name: Emergency Chrome Extension Test
on:
  workflow_dispatch:
  push:
    branches: [main]

jobs:
  test-consent-popup:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Chrome
        uses: browser-actions/setup-chrome@latest
        
      - name: Build Extension
        run: |
          cd extension.chrome
          npm ci
          npm run build
          
      - name: Test with Puppeteer
        run: |
          npm install puppeteer
          node test-consent-popup.js
          
      - name: Upload Screenshots
        uses: actions/upload-artifact@v3
        if: always()
        with:
          name: test-screenshots
          path: screenshots/
GH_EOF

# SOLUTION 3: AWS EC2 Quick Deploy
echo "=== SOLUTION 3: AWS EC2 with Chrome ==="
cat > aws-chrome-instance.sh << 'AWS_EOF'
#!/bin/bash
# Deploy EC2 with Chrome Desktop
aws ec2 run-instances \
  --image-id ami-0c02fb55956c7d316 \
  --instance-type t2.micro \
  --key-name devops-emergency \
  --security-groups chrome-test-sg \
  --user-data '#!/bin/bash
    apt update
    apt install -y ubuntu-desktop chrome-browser
    apt install -y xrdp
    systemctl enable xrdp
    echo "ubuntu:TestPass123!" | chpasswd
  ' \
  --tag-specifications 'ResourceType=instance,Tags=[{Key=Name,Value=Chrome-Test-Emergency}]'
AWS_EOF

# SOLUTION 4: Puppeteer Automated Test
echo "=== SOLUTION 4: Puppeteer Automated Test ==="
cat > test-consent-popup.js << 'PUPPETEER_EOF'
const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

(async () => {
  console.log('🚨 EMERGENCY Chrome Test Starting...');
  
  const pathToExtension = path.join(__dirname, 'extension.chrome', 'dist');
  
  const browser = await puppeteer.launch({
    headless: false,
    args: [
      `--disable-extensions-except=${pathToExtension}`,
      `--load-extension=${pathToExtension}`,
      '--no-sandbox',
      '--disable-setuid-sandbox'
    ]
  });

  // Wait for extension to load
  await new Promise(resolve => setTimeout(resolve, 2000));

  // Find extension ID
  const targets = await browser.targets();
  const extensionTarget = targets.find(t => t.type() === 'service_worker');
  
  if (!extensionTarget) {
    console.error('❌ Extension failed to load!');
    process.exit(1);
  }

  const extensionId = extensionTarget.url().match(/chrome-extension:\/\/([^\/]+)/)[1];
  console.log(`✅ Extension loaded: ${extensionId}`);

  // Test popup
  const page = await browser.newPage();
  await page.goto(`chrome-extension://${extensionId}/src/popup.html`);
  
  // Wait for consent popup
  await page.waitForTimeout(1000);
  
  // Check for consent
  const hasConsent = await page.evaluate(() => {
    const consent = document.querySelector('[data-consent], #telemetry-consent, .consent-popup');
    return consent !== null;
  });

  // Screenshot
  fs.mkdirSync('screenshots', { recursive: true });
  await page.screenshot({ 
    path: 'screenshots/consent-popup-test.png',
    fullPage: true 
  });

  console.log('📊 CONSENT POPUP TEST RESULTS:');
  console.log(`   Status: ${hasConsent ? '✅ FOUND' : '❌ NOT FOUND'}`);
  console.log('   Screenshot: screenshots/consent-popup-test.png');
  
  // Test ChatGPT page
  const chatPage = await browser.newPage();
  await chatPage.goto('https://chat.openai.com');
  await chatPage.waitForTimeout(2000);
  
  const logs = [];
  chatPage.on('console', msg => logs.push(msg.text()));
  
  await chatPage.screenshot({ 
    path: 'screenshots/chatgpt-test.png',
    fullPage: true 
  });

  console.log('📝 Console logs:', logs);
  
  await browser.close();
  
  // Report results
  console.log('\n🎯 TEST COMPLETE!');
  console.log(`Consent Popup: ${hasConsent ? 'PASSED ✅' : 'FAILED ❌'}`);
  process.exit(hasConsent ? 0 : 1);
})();
PUPPETEER_EOF

echo "🚀 QUICK START COMMANDS:"
echo ""
echo "1️⃣ DOCKER (30 seconds):"
echo "   bash docker-chrome-emergency.sh"
echo "   Open: http://localhost:7900 (pass: secret)"
echo ""
echo "2️⃣ PUPPETEER (1 minute):"
echo "   npm install puppeteer"
echo "   node test-consent-popup.js"
echo ""
echo "3️⃣ GITHUB ACTIONS (2 minutes):"
echo "   git add . && git commit -m 'Emergency test'"
echo "   git push origin main"
echo ""
echo "4️⃣ AWS EC2 (5 minutes):"
echo "   bash aws-chrome-instance.sh"
echo ""
echo "🔥 RUNNING DOCKER OPTION NOW..."
bash docker-chrome-emergency.sh