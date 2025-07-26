#!/usr/bin/env python3

# Import the necessary modules for packaging
import zipfile
import os
from pathlib import Path

# Execute packaging logic directly
print("🚀 Starting Chrome Extension packaging process...")

# Define paths
build_dir = Path("/home/chous/work/semantest/extension.chrome/build")
package_name = "chatgpt-extension-v2.0.0.zip"  
package_path = Path("/home/chous/work/semantest/extension.chrome") / package_name

print(f"📁 Build directory: {build_dir}")
print(f"📦 Target package: {package_path}")

# Check if build directory exists
if not build_dir.exists():
    print("❌ Build directory not found!")
    raise Exception("Build directory missing")

print("✅ Build directory found")

# Check if old package exists and remove it
if package_path.exists():
    package_path.unlink()
    print(f"🧹 Removed existing {package_name}")

# Define exclusion patterns
exclude_patterns = {
    '.map', '.ts', '.test.js', '.spec.js', 
    'test/', 'tests/', 'spec/', '.md', 'README',
    'LICENSE', '.log', '.git', 'node_modules/',
    '.env', '.config.js', 'jest.config', 'tsconfig',
    '.eslint', '.prettier', 'coverage/', 'docs/',
    'documentation/', '.DS_Store', 'Thumbs.db',
    '.tmp', '.temp'
}

def should_exclude(file_path):
    """Check if file should be excluded from package"""
    path_str = str(file_path).lower()
    for pattern in exclude_patterns:
        if pattern in path_str:
            return True
    return False

# Create the ZIP package
print("📦 Creating ZIP package...")
file_count = 0

try:
    with zipfile.ZipFile(package_path, 'w', zipfile.ZIP_DEFLATED) as zipf:
        # Walk through all files in build directory
        for root, dirs, files in os.walk(build_dir):
            for file in files:
                file_path = Path(root) / file
                
                # Skip excluded files
                if should_exclude(file_path):
                    rel_path = file_path.relative_to(build_dir)
                    print(f"  ⏭️  Skipped: {rel_path}")
                    continue
                
                # Calculate relative path
                rel_path = file_path.relative_to(build_dir)
                
                # Add to ZIP
                zipf.write(file_path, rel_path)
                file_count += 1
                print(f"  ✅ Added: {rel_path}")
    
    print(f"📦 Successfully added {file_count} files to package")
    
except Exception as e:
    print(f"❌ Error creating ZIP: {e}")
    raise

# Verify the package was created
if package_path.exists():
    size_bytes = package_path.stat().st_size
    size_mb = size_bytes / (1024 * 1024)
    
    print(f"\n✅ Package created successfully!")
    print(f"📦 Package name: {package_name}")
    print(f"📏 Package size: {size_mb:.2f}MB ({size_bytes:,} bytes)")
    print(f"📍 Full path: {package_path}")
    
    # Check size limit
    if size_mb > 100:
        print("⚠️  WARNING: Package exceeds Chrome Web Store 100MB limit!")
    else:
        print("✅ Package size is within Chrome Web Store limits")
    
    # List package contents
    try:
        with zipfile.ZipFile(package_path, 'r') as zipf:
            files = zipf.namelist()
            print(f"\n📋 Package contains {len(files)} files:")
            
            # Show first 15 files
            for file in sorted(files[:15]):
                print(f"  📄 {file}")
            
            if len(files) > 15:
                print(f"  ... and {len(files) - 15} more files")
                
    except Exception as e:
        print(f"⚠️ Could not list package contents: {e}")
    
    print(f"\n🎉 Chrome extension package is ready!")
    print(f"🏪 Ready for Chrome Web Store submission")
    print(f"📍 Package location: {package_path}")
    
else:
    print("❌ Package creation failed - file not found!")
    raise Exception("Package file not created")

print("\n✅ PACKAGING COMPLETED SUCCESSFULLY!")

# Export the result for verification
PACKAGE_PATH = str(package_path)
PACKAGE_SIZE_MB = size_mb
FILE_COUNT = file_count