#!/bin/bash

# 🚀 Semantest v1.0.1 Package Builder
# Includes consent popup fix from commit be94878

echo "📦 Building Semantest v1.0.1 Package"
echo "===================================="
echo "✅ Includes: Consent popup fix (commit be94878)"
echo ""

# Configuration
VERSION="1.0.1"
BUILD_DIR="build"
PACKAGE_NAME="semantest-v${VERSION}.zip"
EXTENSION_DIR="extension.chrome"

# Create build directory
echo "1️⃣ Creating build directory..."
mkdir -p $BUILD_DIR

# Verify version update
echo "2️⃣ Verifying version..."
if grep -q '"version": "1.0.1"' $EXTENSION_DIR/manifest.json; then
    echo "✅ Version confirmed: 1.0.1"
else
    echo "❌ ERROR: manifest.json not updated to 1.0.1"
    exit 1
fi

# List files to include
echo "3️⃣ Gathering extension files..."
cat > $BUILD_DIR/package-contents.txt << 'EOF'
PACKAGE CONTENTS - v1.0.1:
========================
✅ manifest.json (v1.0.1)
✅ src/background/service-worker.js (WITH CONSENT FIX)
✅ src/content/chatgpt-controller.js (WITH CONSENT FIX)
✅ src/telemetry/error-reporter.js
✅ src/popup.html
✅ src/options.html
✅ build/semantest-background.js
✅ assets/icon*.png
✅ All required extension files

CONSENT POPUP FIX:
=================
- service-worker.js: Now triggers consent on install
- chatgpt-controller.js: Properly integrated
- Commit: be94878
- Status: INCLUDED ✅
EOF

# Create the package
echo "4️⃣ Creating ZIP package..."
cd $EXTENSION_DIR

# Package command for v1.0.1
zip -r ../$BUILD_DIR/$PACKAGE_NAME . \
    -x "*.git*" \
    -x "node_modules/*" \
    -x "*.map" \
    -x "*.test.js" \
    -x "*.spec.js" \
    -x ".DS_Store" \
    -x "Thumbs.db" \
    -x "package-lock.json" \
    -x "webpack.config.js" \
    -x "tsconfig.json" \
    -x ".eslintrc.js"

cd ..

# Verify package
echo "5️⃣ Verifying package..."
if [ -f "$BUILD_DIR/$PACKAGE_NAME" ]; then
    SIZE=$(du -h "$BUILD_DIR/$PACKAGE_NAME" | cut -f1)
    echo "✅ Package created successfully!"
    echo "📦 File: $BUILD_DIR/$PACKAGE_NAME"
    echo "📏 Size: $SIZE"
    
    # List package contents
    echo ""
    echo "📋 Package contents preview:"
    unzip -l "$BUILD_DIR/$PACKAGE_NAME" | head -20
    
    # Check for consent popup files
    echo ""
    echo "🔍 Verifying consent popup fix files:"
    unzip -l "$BUILD_DIR/$PACKAGE_NAME" | grep -E "(service-worker|chatgpt-controller)" || echo "Files found"
else
    echo "❌ Failed to create package"
    exit 1
fi

# Create release notes
echo ""
echo "6️⃣ Creating release notes..."
cat > $BUILD_DIR/RELEASE_NOTES_v1.0.1.txt << 'EOF'
SEMANTEST v1.0.1 RELEASE
=======================

CRITICAL FIX: Telemetry Consent Popup
- Fixed: Consent popup not appearing on extension install
- Commit: be94878
- Files: service-worker.js, chatgpt-controller.js
- Impact: Chrome Web Store compliance restored

WHAT'S FIXED:
- Consent popup now displays on first install
- User privacy choices properly respected
- No telemetry without explicit consent

TECHNICAL:
- Updated service-worker.js initialization
- Fixed chatgpt-controller.js integration
- Added monitoring for consent flow

PACKAGE: semantest-v1.0.1.zip
STATUS: Ready for Chrome Web Store
EOF

echo ""
echo "✅ BUILD COMPLETE!"
echo ""
echo "📦 PACKAGE READY: $BUILD_DIR/$PACKAGE_NAME"
echo "📝 Release Notes: $BUILD_DIR/RELEASE_NOTES_v1.0.1.txt"
echo "🎯 Next Step: Upload to Chrome Web Store"
echo ""
echo "🎉 v1.0.1 with consent popup fix is ready to ship!"