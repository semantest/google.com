# 🔧 QA LIBGOBJECT LIBRARY FIX

## IMMEDIATE SOLUTION

### Ubuntu/Debian:
```bash
sudo apt-get update
sudo apt-get install -y libglib2.0-0 libgobject-2.0-0 libgtk-3-0
```

### macOS:
```bash
brew install glib gtk+3
```

### Docker/CI Environment:
```dockerfile
# Add to Dockerfile
RUN apt-get update && apt-get install -y \
    libglib2.0-0 \
    libgobject-2.0-0 \
    libgtk-3-0 \
    libnotify4 \
    libnss3 \
    libxss1 \
    libxtst6 \
    xvfb \
    && rm -rf /var/lib/apt/lists/*
```

### GitHub Actions Fix:
```yaml
- name: Install system dependencies
  run: |
    sudo apt-get update
    sudo apt-get install -y libglib2.0-0 libgobject-2.0-0 libgtk-3-0
```

## COMMON QA BLOCKERS

### Missing Libraries for Puppeteer/Playwright:
```bash
# Full dependency install
sudo apt-get install -y \
    libx11-xcb1 \
    libxcomposite1 \
    libxcursor1 \
    libxdamage1 \
    libxi6 \
    libxtst6 \
    libnss3 \
    libcups2 \
    libxss1 \
    libxrandr2 \
    libasound2 \
    libatk1.0-0 \
    libatk-bridge2.0-0 \
    libpangocairo-1.0-0 \
    libgtk-3-0 \
    libgbm1
```

### Quick Docker Solution:
```bash
# Use this base image for QA
FROM mcr.microsoft.com/playwright:v1.40.0-focal
```

## VERIFICATION
```bash
# Check if libraries installed
ldconfig -p | grep gobject
```

**STATUS**: Run the appropriate command above based on QA's OS!