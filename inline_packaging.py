#!/usr/bin/env python3

# Inline packaging execution
print("🚀 Starting inline packaging process...")

# Execute the packaging logic immediately
import zipfile
from pathlib import Path

# Setup
build_dir = Path("/home/chous/work/semantest/extension.chrome/build")
package_path = Path("/home/chous/work/semantest/extension.chrome/chatgpt-extension-v2.0.0.zip")

print(f"📁 Build: {build_dir}")
print(f"📦 Target: {package_path}")

# Cleanup
if package_path.exists():
    package_path.unlink()
    print("🧹 Removed old package")

# Create package
print("📦 Creating ZIP...")
with zipfile.ZipFile(package_path, 'w', zipfile.ZIP_DEFLATED) as zipf:
    file_count = 0
    for file_path in build_dir.rglob('*'):
        if file_path.is_file():
            # Skip test files
            if '.test.' in file_path.name or '.spec.' in file_path.name:
                continue
            
            rel_path = file_path.relative_to(build_dir)
            zipf.write(file_path, rel_path)
            file_count += 1
            print(f"  ✅ {rel_path}")

print(f"📦 Added {file_count} files")

# Verify
if package_path.exists():
    size_mb = package_path.stat().st_size / (1024 * 1024)
    print(f"✅ SUCCESS: {package_path}")
    print(f"📏 Size: {size_mb:.2f}MB")
    
    # Show some contents
    with zipfile.ZipFile(package_path, 'r') as zipf:
        files = zipf.namelist()
        print(f"📋 Contains {len(files)} files")
        print("📄 Key files:")
        for f in sorted(files)[:10]:
            print(f"  - {f}")
        if len(files) > 10:
            print(f"  ... and {len(files)-10} more")
    
    print(f"\n🎉 PACKAGE READY!")
    print(f"📍 EXACT LOCATION: {package_path}")
else:
    print("❌ FAILED!")

exec_result = "COMPLETED"