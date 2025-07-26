#!/usr/bin/env python3

# Manual package creation with immediate execution
import zipfile
import os
from pathlib import Path

print("🚀 Starting manual Chrome extension packaging...")

# Set up paths
build_directory = "/home/chous/work/semantest/extension.chrome/build"
output_package = "/home/chous/work/semantest/extension.chrome/chatgpt-extension-v2.0.0.zip"

print(f"📁 Build directory: {build_directory}")
print(f"📦 Output package: {output_package}")

# Verify build directory exists
build_path = Path(build_directory)
if not build_path.exists():
    print(f"❌ Build directory not found: {build_directory}")
    exit(1)

print("✅ Build directory confirmed")

# Remove existing package if it exists
package_path = Path(output_package)
if package_path.exists():
    package_path.unlink()
    print("🧹 Removed existing package")

# Count files and create file list
files_to_include = []
for root, dirs, files in os.walk(build_directory):
    for file in files:
        file_path = Path(root) / file
        
        # Skip test files
        if '.test.js' in file or '.spec.js' in file:
            continue
            
        rel_path = file_path.relative_to(build_path)
        files_to_include.append((file_path, rel_path))

print(f"📋 Found {len(files_to_include)} files to include")

# Create the ZIP package
print("📦 Creating ZIP package...")
try:
    with zipfile.ZipFile(output_package, 'w', zipfile.ZIP_DEFLATED) as zipf:
        for file_path, rel_path in files_to_include:
            zipf.write(file_path, rel_path)
            print(f"  ✅ Added: {rel_path}")
    
    print(f"📦 Successfully created ZIP with {len(files_to_include)} files")
    
except Exception as e:
    print(f"❌ Error creating ZIP: {e}")
    exit(1)

# Verify the package was created and get its size
if package_path.exists():
    size_bytes = package_path.stat().st_size
    size_mb = size_bytes / (1024 * 1024)
    
    print(f"\n✅ Package created successfully!")
    print(f"📦 Package name: chatgpt-extension-v2.0.0.zip")
    print(f"📏 Package size: {size_mb:.2f}MB ({size_bytes:,} bytes)")
    print(f"📍 Package location: {output_package}")
    
    # Check Chrome Web Store size limit
    if size_mb <= 100:
        print("✅ Package size is within Chrome Web Store limits")
    else:
        print("⚠️ WARNING: Package exceeds Chrome Web Store 100MB limit")
    
    # Show package contents summary
    try:
        with zipfile.ZipFile(output_package, 'r') as zipf:
            files = zipf.namelist()
            print(f"\n📋 Package contains {len(files)} files:")
            
            # Show key files
            key_files = ['manifest.json', 'background.js', 'content_script.js', 'popup.html', 'popup.js']
            for key_file in key_files:
                if key_file in files:
                    print(f"  📄 {key_file}")
            
            # Show directories
            directories = set()
            for f in files:
                if '/' in f:
                    directories.add(f.split('/')[0])
            
            for d in sorted(directories):
                dir_files = [f for f in files if f.startswith(f"{d}/")]
                print(f"  📂 {d}/ ({len(dir_files)} files)")
                
    except Exception as e:
        print(f"⚠️ Could not analyze package contents: {e}")
    
    print(f"\n🎉 Chrome Extension Package Ready!")
    print(f"🏪 Ready for Chrome Web Store submission")
    print(f"📍 EXACT FILE LOCATION: {output_package}")
    
else:
    print("❌ Package creation failed - file not found")
    exit(1)

print("\n✅ PACKAGING PROCESS COMPLETED SUCCESSFULLY!")

# Create a simple execution result
EXECUTION_RESULT = {
    'success': True,
    'package_path': output_package,
    'package_size_mb': size_mb,
    'file_count': len(files_to_include)
}

# Immediate execution of the packaging
if __name__ == "__main__":
    print("Executing packaging immediately...")
    # This will run when the file is executed