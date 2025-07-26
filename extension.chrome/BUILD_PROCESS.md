# Chrome Extension Build Process

## 🔧 Build System Overview

**Tool Stack**:
- **Bundler**: Webpack 5
- **Language**: TypeScript
- **Testing**: Jest
- **Linting**: ESLint + TypeScript ESLint
- **Validation**: web-ext (Mozilla's extension validator)

## 📦 Package Scripts

```bash
# Development
npm run dev          # Build and watch for changes
npm run build:dev    # Build development version

# Production
npm run build        # Build production version
npm run package      # Build + create ZIP for Chrome Web Store

# Quality Assurance  
npm run test         # Run Jest tests
npm run test:watch   # Run tests in watch mode
npm run lint         # ESLint + auto-fix
npm run typecheck    # TypeScript validation
npm run validate     # Validate extension with web-ext

# Utilities
npm run clean        # Remove dist folder
npm run start:chrome # Launch Chrome with extension loaded
```

## 🏗️ Build Pipeline

### 1. Source Structure
```
extension.chrome/
├── src/
│   ├── background.ts      # Service worker
│   ├── content-script.ts  # Content script
│   ├── popup.ts          # Popup functionality  
│   ├── options.ts        # Options page
│   ├── popup.html        # Popup UI
│   ├── options.html      # Options UI
│   └── types/            # TypeScript definitions
├── public/
│   ├── manifest.json     # Extension manifest
│   ├── icons/           # Extension icons
│   └── *.png           # Additional assets
└── dist/                # Build output (generated)
```

### 2. Build Process

**Development Build** (`npm run build:dev`):
1. TypeScript compilation with source maps
2. Asset copying (manifest, icons)
3. HTML generation (popup, options)
4. No minification for debugging

**Production Build** (`npm run build`):
1. TypeScript compilation (optimized)
2. Code minification and optimization
3. Asset optimization
4. Source map generation (separate files)
5. Bundle splitting for better caching

**Package Creation** (`npm run package`):
1. Production build
2. ZIP creation from dist/ folder
3. Exclusion of development files
4. Ready for Chrome Web Store submission

## 🚀 GitHub Actions CI/CD

### Triggers
- **Push to main**: Production build + package creation
- **Push to develop**: Development build + testing
- **Pull requests**: Testing + build validation
- **Manual dispatch**: On-demand builds

### Pipeline Stages

1. **Test**: ESLint, TypeScript check, Jest tests
2. **Build**: Create optimized extension bundle
3. **Validate**: Extension validation with web-ext
4. **Security**: npm audit + secret scanning
5. **Package**: ZIP creation for distribution
6. **Artifacts**: Upload build outputs

## 📋 Build Outputs

### Development Build
- **Location**: `dist/`
- **Features**: Source maps, unminified code
- **Usage**: Local testing and debugging

### Production Build  
- **Location**: `dist/`
- **Package**: `chatgpt-extension-v{version}.zip`
- **Features**: Minified, optimized, production-ready
- **Usage**: Chrome Web Store submission

## 🔍 Quality Gates

### Pre-commit Checks
- TypeScript compilation
- ESLint validation
- Import sorting
- Prettier formatting

### CI Pipeline Checks
- All tests passing
- TypeScript strict mode compliance
- No ESLint errors or warnings
- Extension manifest validation
- Security vulnerability scanning
- Package size under 50MB

## 🛠️ Development Workflow

### 1. Initial Setup
```bash
cd extension.chrome
npm install
```

### 2. Development
```bash
npm run dev
# Opens webpack in watch mode
# Load extension from dist/ folder in Chrome
```

### 3. Testing Extension in Chrome
```bash
# Method 1: Automated
npm run start:chrome

# Method 2: Manual
# 1. Open chrome://extensions/
# 2. Enable Developer mode
# 3. Click "Load unpacked"
# 4. Select dist/ folder
```

### 4. Production Build
```bash
npm run build
npm run package
# Creates: chatgpt-extension-v{version}.zip
```

## 📊 Build Optimization

### Bundle Analysis
- **Vendor**: Separate chunk for node_modules
- **Main**: Application code chunks
- **Assets**: Optimized images and static files

### Size Optimization
- Tree shaking for unused code elimination
- Code splitting for better caching
- Asset optimization (images, fonts)
- Minification for production builds

### Performance
- **Target**: Sub-100ms extension startup
- **Monitoring**: Bundle size tracking
- **Optimization**: Lazy loading where possible

## 🔒 Security Considerations

### Content Security Policy
- Strict CSP in manifest.json
- No inline scripts allowed
- External resource restrictions

### Permissions
- Minimal required permissions
- Host permissions only for necessary domains
- No unnecessary API access

### Dependencies
- Regular security audits
- Automated vulnerability scanning
- Minimal dependency footprint

## 🚨 Error Handling

### Build Errors
- TypeScript compilation errors stop build
- ESLint errors prevent packaging
- Missing assets cause build failure

### Runtime Error Tracking
- Integration with error tracking service
- Source map support for debugging
- User-friendly error reporting

## 📈 Monitoring

### Build Metrics
- Bundle size tracking
- Build time monitoring
- Test coverage reporting
- Dependency vulnerability scanning

### Success Criteria
- ✅ All tests pass
- ✅ TypeScript compiles without errors
- ✅ ESLint passes with zero warnings
- ✅ Extension validates with web-ext
- ✅ Package size < 50MB
- ✅ No security vulnerabilities

## 🔄 Release Process

### Version Bumping
```bash
# Update version in package.json
npm version patch|minor|major

# This updates:
# - package.json version
# - Creates git tag
# - Triggers CI/CD pipeline
```

### GitHub Release Creation
1. CI/CD builds and tests
2. Production package created
3. Artifacts uploaded
4. Ready for manual release creation
5. Chrome Web Store submission

---

**Status**: ✅ BUILD SYSTEM READY

Build pipeline configured and ready for Engineer to implement extension code!