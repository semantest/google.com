#!/usr/bin/env python3
"""
Create beta release package for Semantest Google Extension v1.0.0-beta
"""

import os
import zipfile
import json
from pathlib import Path

def create_beta_package():
    """Create the beta release package"""
    
    # Define package name
    package_name = "chatgpt-extension-v1.0.0-beta.zip"
    
    # Files to include in the package
    files_to_include = [
        # Core extension files
        "manifest.json",
        "popup.html",
        "background.js",
        "content_script.js",
        
        # Source files
        "src/index.ts",
        "src/google-buddy-client.ts",
        
        # Domain layer
        "src/domain/index.ts",
        "src/domain/entities/google-search.ts",
        "src/domain/entities/search-result.ts",
        "src/domain/value-objects/search-query.ts",
        "src/domain/events/index.ts",
        "src/domain/events/search-requested.event.ts",
        "src/domain/events/search-completed.event.ts",
        "src/domain/events/search-failed.event.ts",
        "src/domain/events/result-clicked.event.ts",
        
        # Application layer
        "src/application/index.ts",
        "src/application/google-application.ts",
        
        # Infrastructure layer
        "src/infrastructure/index.ts",
        "src/infrastructure/adapters/google-search-adapter.ts",
        "src/infrastructure/adapters/google-communication-adapter.ts",
        
        # Configuration files
        "package.json",
        "tsconfig.json",
        
        # Documentation
        "README.org",
        "TEST_PLAN_GOOGLE_IMAGES.md",
        "TEST_REPORT_GOOGLE_IMAGES.md",
    ]
    
    # Directories to include
    directories_to_include = [
        "dist",  # Compiled JavaScript files
        "icons", # Extension icons
    ]
    
    print(f"Creating beta package: {package_name}")
    
    # Verify manifest version
    try:
        with open("manifest.json", "r") as f:
            manifest = json.load(f)
            version = manifest.get("version", "unknown")
            print(f"Manifest version: {version}")
            if version != "1.0.0-beta":
                print(f"⚠️  Warning: Expected version 1.0.0-beta, found {version}")
    except Exception as e:
        print(f"⚠️  Could not verify manifest version: {e}")
    
    # Create the zip file
    with zipfile.ZipFile(package_name, 'w', zipfile.ZIP_DEFLATED) as zipf:
        # Add individual files
        for file_path in files_to_include:
            if os.path.exists(file_path):
                zipf.write(file_path, file_path)
                print(f"  ✓ Added: {file_path}")
            else:
                print(f"  ⚠️  Skipped (not found): {file_path}")
        
        # Add directories
        for dir_path in directories_to_include:
            if os.path.exists(dir_path):
                for root, dirs, files in os.walk(dir_path):
                    for file in files:
                        file_path = os.path.join(root, file)
                        arcname = os.path.relpath(file_path)
                        zipf.write(file_path, arcname)
                print(f"  ✓ Added directory: {dir_path}")
            else:
                print(f"  ⚠️  Skipped directory (not found): {dir_path}")
    
    # Verify package creation
    if os.path.exists(package_name):
        size = os.path.getsize(package_name)
        print(f"\n✅ Package created successfully!")
        print(f"   File: {package_name}")
        print(f"   Size: {size:,} bytes ({size/1024:.1f} KB)")
        
        # List package contents
        print(f"\n📦 Package contents:")
        with zipfile.ZipFile(package_name, 'r') as zipf:
            file_list = zipf.namelist()
            for i, name in enumerate(sorted(file_list), 1):
                print(f"   {i:3d}. {name}")
        
        print(f"\n   Total files: {len(file_list)}")
        
        return True
    else:
        print(f"\n❌ Failed to create package")
        return False

if __name__ == "__main__":
    # Change to script directory
    script_dir = os.path.dirname(os.path.abspath(__file__))
    os.chdir(script_dir)
    
    # Create the package
    success = create_beta_package()
    exit(0 if success else 1)