#!/usr/bin/env python3

# Direct execution of ZIP packaging
import zipfile
import os
from pathlib import Path

def create_chrome_extension_package():
    """Create Chrome extension ZIP package"""
    
    # Define paths
    build_dir = Path("/home/chous/work/semantest/extension.chrome/build")
    package_name = "chatgpt-extension-v2.0.0.zip"
    package_path = Path("/home/chous/work/semantest/extension.chrome") / package_name
    
    print("🚀 Creating ChatGPT Extension v2.0.0 Package")
    print(f"📁 Source: {build_dir}")
    print(f"📦 Target: {package_path}")
    
    # Verify build directory exists
    if not build_dir.exists():
        raise FileNotFoundError(f"Build directory not found: {build_dir}")
    
    # Remove existing package
    if package_path.exists():
        package_path.unlink()
        print("🧹 Removed existing package")
    
    # Create ZIP package
    file_count = 0
    excluded_count = 0
    
    with zipfile.ZipFile(package_path, 'w', zipfile.ZIP_DEFLATED) as zipf:
        for root, dirs, files in os.walk(build_dir):
            for file in files:
                file_path = Path(root) / file
                rel_path = file_path.relative_to(build_dir)
                
                # Skip test files
                if '.test.js' in file or '.spec.js' in file:
                    excluded_count += 1
                    continue
                
                # Add to ZIP
                zipf.write(file_path, rel_path)
                file_count += 1
                print(f"  ✅ {rel_path}")
    
    print(f"📦 Added {file_count} files (excluded {excluded_count} test files)")
    
    # Verify package
    if package_path.exists():
        size_bytes = package_path.stat().st_size
        size_mb = size_bytes / (1024 * 1024)
        
        print(f"\n✅ Package created successfully!")
        print(f"📦 Name: {package_name}")
        print(f"📏 Size: {size_mb:.2f}MB ({size_bytes:,} bytes)")
        print(f"📍 Location: {package_path}")
        
        # Chrome Web Store size check
        if size_mb <= 100:
            print("✅ Size is within Chrome Web Store limits (100MB)")
        else:
            print("⚠️ WARNING: Size exceeds Chrome Web Store 100MB limit!")
        
        # List contents
        with zipfile.ZipFile(package_path, 'r') as zipf:
            files = zipf.namelist()
            print(f"\n📋 Package contains {len(files)} files:")
            
            # Show key files
            key_files = ['manifest.json', 'background.js', 'content_script.js', 'popup.html', 'popup.js']
            for key_file in key_files:
                if key_file in files:
                    print(f"  📄 {key_file}")
            
            # Show directories
            dirs = set()
            for f in files:
                if '/' in f:
                    dirs.add(f.split('/')[0])
            
            for d in sorted(dirs):
                dir_files = [f for f in files if f.startswith(f"{d}/")]
                print(f"  📂 {d}/ ({len(dir_files)} files)")
        
        print(f"\n🎉 Chrome Extension Package Ready!")
        print(f"🏪 Ready for Chrome Web Store submission")
        print(f"📍 EXACT FILE LOCATION: {package_path}")
        
        return str(package_path), size_mb
    
    else:
        raise RuntimeError("Package creation failed - file not found")

# Execute the function immediately
try:
    package_location, package_size = create_chrome_extension_package()
    print(f"\n✅ PACKAGING COMPLETED SUCCESSFULLY!")
    print(f"📦 Final package location: {package_location}")
    print(f"📏 Final package size: {package_size:.2f}MB")
    
    # Set variables for external access
    FINAL_PACKAGE_PATH = package_location
    FINAL_PACKAGE_SIZE_MB = package_size
    PACKAGING_SUCCESS = True
    
except Exception as e:
    print(f"\n❌ PACKAGING FAILED: {e}")
    import traceback
    traceback.print_exc()
    
    FINAL_PACKAGE_PATH = None
    FINAL_PACKAGE_SIZE_MB = 0
    PACKAGING_SUCCESS = False

print("\n🔚 Script execution completed.")