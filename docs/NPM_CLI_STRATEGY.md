# 📦 Semantest NPM CLI Package Strategy

## Overview

Transform Semantest into a dual-distribution model: Browser Extension + CLI/SDK.

## 🎯 NPM Package Structure

### Package Architecture
```
semantest-cli/
├── package.json          # NPM configuration
├── bin/
│   └── semantest        # CLI entry point
├── lib/
│   ├── cli.js           # CLI command handler
│   ├── api/             # Core API client
│   ├── browser/         # Browser automation
│   └── utils/           # Shared utilities
├── dist/                # Built files
└── README.md            # CLI documentation
```

### package.json Configuration
```json
{
  "name": "semantest-cli",
  "version": "2.0.0",
  "description": "CLI for ChatGPT automation and browser extension control",
  "bin": {
    "semantest": "./bin/semantest"
  },
  "main": "./lib/index.js",
  "engines": {
    "node": ">=14.0.0"
  },
  "scripts": {
    "build": "tsc",
    "test": "jest",
    "prepublishOnly": "npm run build && npm test"
  },
  "keywords": ["chatgpt", "automation", "cli", "browser-extension"],
  "repository": "github:semantest/cli"
}
```

## 🔧 CLI Commands Structure

### Core Commands
```bash
# Authentication
semantest auth login
semantest auth logout
semantest auth status

# Project Management
semantest project create <name>
semantest project list
semantest project use <name>

# ChatGPT Automation
semantest chat new [--project <name>]
semantest chat send <message>
semantest chat export [--format json|md]

# Extension Control
semantest extension install
semantest extension status
semantest extension config

# Script Execution
semantest run <script.js>
semantest watch <script.js>
```

### Implementation Example
```javascript
#!/usr/bin/env node
// bin/semantest

const { Command } = require('commander');
const program = new Command();

program
  .name('semantest')
  .description('CLI for ChatGPT automation')
  .version('2.0.0');

program
  .command('auth')
  .description('Manage authentication')
  .action(require('../lib/commands/auth'));

program
  .command('chat')
  .description('ChatGPT automation')
  .action(require('../lib/commands/chat'));

program.parse();
```

## 🚀 NPM Publishing Strategy

### 1. Scoped Package
```bash
# Publish under organization
npm publish --access public
# Creates: @semantest/cli
```

### 2. Installation Methods
```bash
# Global CLI
npm install -g semantest-cli

# Project dependency
npm install --save-dev semantest-cli

# NPX execution
npx semantest-cli chat new
```

### 3. Version Management
- **Major**: Breaking changes (1.x.x → 2.0.0)
- **Minor**: New features (2.0.x → 2.1.0)
- **Patch**: Bug fixes (2.1.0 → 2.1.1)

## 🔗 Extension Integration

### Approach 1: Extension as Dependency
```javascript
// CLI can control installed extension
const { Extension } = require('./extension-bridge');

class ExtensionController {
  async connect() {
    // Connect to running extension via native messaging
    this.extension = await Extension.connect();
  }
  
  async sendCommand(cmd) {
    return this.extension.execute(cmd);
  }
}
```

### Approach 2: Bundled Extension
```javascript
// Package extension within CLI
const EXTENSION_PATH = path.join(__dirname, '../extension');

async function installExtension() {
  // Programmatically install extension
  await chrome.installExtension(EXTENSION_PATH);
}
```

## 📊 Distribution Channels

### 1. NPM Registry
- Primary distribution for CLI
- Supports versioning
- Easy updates via `npm update`

### 2. GitHub Releases
- Binary distributions
- Platform-specific builds
- Direct downloads

### 3. Homebrew (macOS)
```ruby
class Semantest < Formula
  desc "ChatGPT automation CLI"
  homepage "https://semantest.com"
  url "https://github.com/semantest/cli/archive/v2.0.0.tar.gz"
  
  def install
    bin.install "semantest"
  end
end
```

### 4. Package Managers
- **Windows**: Chocolatey/Scoop
- **Linux**: Snap/AppImage
- **Cross-platform**: Docker

## 🎯 Benefits of CLI Distribution

1. **Developer-Friendly**
   - Scriptable automation
   - CI/CD integration
   - Programmatic access

2. **No Browser Required**
   - Headless operation
   - Server deployment
   - Batch processing

3. **Version Control**
   - Package.json tracking
   - Dependency management
   - Reproducible builds

4. **Enterprise Ready**
   - Private registries
   - License management
   - Audit trails

---

**Next Steps**:
1. Create npm package structure
2. Implement core CLI commands
3. Bridge to extension functionality
4. Set up publishing pipeline