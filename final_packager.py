#!/usr/bin/env python3

# Inline execution of ZIP creation
import zipfile
import os
from pathlib import Path

print("🚀 Creating ChatGPT Extension v2.0.0 package...")

# Define paths
build_dir = Path("/home/chous/work/semantest/extension.chrome/build")
package_name = "chatgpt-extension-v2.0.0.zip"
package_path = Path("/home/chous/work/semantest/extension.chrome") / package_name

print(f"📁 Build directory: {build_dir}")
print(f"📦 Package path: {package_path}")

# Verify build directory exists
if not build_dir.exists():
    print("❌ Build directory not found!")
    exit(1)
    
print("✅ Build directory confirmed")

# Remove existing package
if package_path.exists():
    package_path.unlink()
    print("🧹 Removed existing package")

# Files to exclude (simplified list)
exclude_patterns = ['.test.js', '.spec.js', '.md', 'README']

file_count = 0

# Create ZIP package
print("📦 Creating ZIP archive...")
with zipfile.ZipFile(package_path, 'w', zipfile.ZIP_DEFLATED) as zipf:
    for root, dirs, files in os.walk(build_dir):
        for file in files:
            file_path = Path(root) / file
            
            # Skip excluded files
            skip_file = False
            for pattern in exclude_patterns:
                if pattern in str(file_path).lower():
                    skip_file = True
                    break
                    
            if skip_file:
                continue
                
            # Add to ZIP
            rel_path = file_path.relative_to(build_dir)
            zipf.write(file_path, rel_path)
            file_count += 1
            print(f"  ✅ {rel_path}")

print(f"📦 Added {file_count} files")

# Verify package
if package_path.exists():
    size_bytes = package_path.stat().st_size
    size_mb = size_bytes / (1024 * 1024)
    
    print(f"\n✅ Package created successfully!")
    print(f"📦 Name: {package_name}")
    print(f"📏 Size: {size_mb:.2f}MB")
    print(f"📍 Location: {package_path}")
    
    if size_mb <= 100:
        print("✅ Within Chrome Web Store size limits")
    else:
        print("⚠️ Exceeds 100MB limit!")
        
    # Show contents
    with zipfile.ZipFile(package_path, 'r') as zipf:
        files = zipf.namelist()
        print(f"\n📋 Contains {len(files)} files:")
        for f in sorted(files[:10]):
            print(f"  📄 {f}")
        if len(files) > 10:
            print(f"  ... +{len(files)-10} more")
    
    print(f"\n🎉 PACKAGE READY FOR CHROME WEB STORE!")
    print(f"📍 EXACT LOCATION: {package_path}")
    
else:
    print("❌ Package creation failed!")
    exit(1)

# Success indicator
PACKAGING_SUCCESS = True
FINAL_PACKAGE_PATH = str(package_path)
FINAL_PACKAGE_SIZE = size_mb