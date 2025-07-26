#!/bin/bash

# GitHub Release Script for v1.0.0
# Working Directory: /home/chous/work/semantest/google.com

set -e

echo "=== GitHub Release v1.0.0 ==="
echo "Working directory: $(pwd)"

# Check if we're in the right directory
if [ ! -f "chatgpt-extension-v1.0.0.zip" ]; then
    echo "Error: chatgpt-extension-v1.0.0.zip not found in current directory"
    exit 1
fi

echo "✅ ZIP file verified: chatgpt-extension-v1.0.0.zip"

# Check git status
echo "📋 Checking git status..."
git status

# Create and push git tag
echo "🏷️ Creating git tag v1.0.0..."
git tag v1.0.0 || echo "Tag v1.0.0 already exists"

echo "⬆️ Pushing tag to remote..."
git push origin v1.0.0

# Check if GitHub CLI is available
if ! command -v gh &> /dev/null; then
    echo "❌ GitHub CLI (gh) is not installed"
    echo "Please install GitHub CLI and run:"
    echo "gh release create v1.0.0 chatgpt-extension-v1.0.0.zip --title 'v1.0.0 - Google Semantest Extension' --notes-file release_notes.md"
    exit 1
fi

# Check GitHub authentication
echo "🔐 Checking GitHub authentication..."
gh auth status

# Create release notes file
cat > release_notes.md << 'EOF'
# Google Semantest Extension v1.0.0

## 🎉 Initial Release

We're excited to announce the first stable release of the Google Semantest Extension! This Chrome extension provides seamless integration with Google services for automated testing and data collection.

## ✨ Features

### 🔍 Google Search Integration
- Automated Google search execution
- Search result extraction and analysis
- Support for various Google search types

### 🖼️ Google Images Support
- Automated image search and collection
- Image metadata extraction
- Download functionality for research purposes

### 🏗️ Architecture
- **Event-Driven Architecture**: Built with TypeScript-EDA foundation
- **Domain-Driven Design**: Clean separation of concerns
- **Type Safety**: Full TypeScript implementation
- **Testing**: Comprehensive E2E test suite with Playwright

## 🛠️ Technical Specifications

- **Manifest Version**: 3 (Chrome Extension Manifest V3)
- **Permissions**: activeTab, storage, scripting
- **Host Permissions**: Google domains (*.google.com/*)
- **TypeScript**: Full type safety and modern development practices
- **Testing**: E2E testing with Playwright

## 📦 Installation

1. Download the `chatgpt-extension-v1.0.0.zip` file
2. Extract the contents
3. Load the extension in Chrome Developer Mode
4. Navigate to Google services to start using the extension

## 🧪 Testing

This release includes comprehensive testing:
- ✅ E2E tests for Google Images functionality
- ✅ Automated download testing
- ✅ Cross-browser compatibility validation
- ✅ Performance benchmarks

## 📚 Documentation

- Complete API documentation
- Test plans and reports
- Migration guides for future versions
- Developer setup instructions

## 🔧 Development

Built with modern web technologies:
- TypeScript 5.2.2
- Chrome Extension Manifest V3
- Playwright for testing
- Event-driven architecture patterns

## 🚀 What's Next

- Chrome Web Store publication
- Additional Google service integrations
- Performance optimizations
- Enhanced error handling

## 👥 Contributing

This project is part of the Semantest framework ecosystem. For contributions and issues, please visit our repository.

---

**Package Contents**: Source code, tests, documentation, and all necessary files for Chrome extension deployment.

**License**: Apache-2.0
EOF

# Create GitHub release
echo "🚀 Creating GitHub release v1.0.0..."
gh release create v1.0.0 \
    --title "v1.0.0 - Google Semantest Extension" \
    --notes-file release_notes.md \
    --latest

# Upload the ZIP file as an asset
echo "📎 Uploading extension package as release asset..."
gh release upload v1.0.0 chatgpt-extension-v1.0.0.zip

echo "✅ GitHub release v1.0.0 created successfully!"
echo "🔗 Release URL: $(gh release view v1.0.0 --web)"