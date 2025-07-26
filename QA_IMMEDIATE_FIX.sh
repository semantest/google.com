#!/bin/bash

# QA Library Installation Script
echo "🔧 Installing libgobject for QA testing..."

# Detect OS
if [ -f /etc/debian_version ]; then
    echo "📦 Detected Debian/Ubuntu system"
    sudo apt-get update
    sudo apt-get install -y \
        libglib2.0-0 \
        libgobject-2.0-0 \
        libgtk-3-0 \
        libnotify4 \
        libnss3 \
        libxss1 \
        libxtst6 \
        xvfb
    echo "✅ Libraries installed successfully!"
    
elif [ -f /etc/redhat-release ]; then
    echo "📦 Detected RedHat/CentOS system"
    sudo yum install -y \
        glib2 \
        gtk3 \
        libnotify \
        nss \
        libXScrnSaver \
        libXtst \
        xorg-x11-server-Xvfb
    echo "✅ Libraries installed successfully!"
    
elif [[ "$OSTYPE" == "darwin"* ]]; then
    echo "📦 Detected macOS system"
    brew install glib gtk+3
    echo "✅ Libraries installed successfully!"
    
else
    echo "❌ Unknown OS - manual installation required"
    echo "Please install: libgobject-2.0.so.0"
fi

# Verify installation
echo "🔍 Verifying libgobject installation..."
if ldconfig -p | grep -q gobject; then
    echo "✅ libgobject CONFIRMED installed!"
    ldconfig -p | grep gobject
else
    echo "⚠️  libgobject not found in ldconfig"
fi