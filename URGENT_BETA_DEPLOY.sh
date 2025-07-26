#!/bin/bash

# URGENT: Beta Deployment Script
echo "🚀 URGENT BETA DEPLOYMENT STARTING..."

# 1. Create GitHub Release
echo "📦 Creating GitHub Release for v1.0.0-beta..."
gh release create v1.0.0-beta \
  chatgpt-extension-v1.0.0-beta.zip \
  --title "ChatGPT Extension v1.0.0-beta" \
  --notes "## 🎉 Beta Release
  
  ### ✨ Features
  - AI-powered ChatGPT automation
  - Project management
  - Custom instructions
  - Image downloads
  
  ### 🚨 Beta Testing
  This is a BETA release for testing purposes.
  
  ### 📥 Installation
  1. Download the ZIP file
  2. Extract to a folder
  3. Open chrome://extensions/
  4. Enable Developer mode
  5. Click 'Load unpacked'
  6. Select the extracted folder" \
  --prerelease

# 2. Deploy to Beta Testing Channel
echo "🔗 Beta Download URL: https://github.com/semantest/workspace/releases/tag/v1.0.0-beta"

# 3. Notify team
echo "✅ BETA DEPLOYED - Ready for testing!"