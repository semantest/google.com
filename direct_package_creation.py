#!/usr/bin/env python3

# Direct inline execution of packaging
import zipfile
import os
from pathlib import Path

def create_package():
    """Create the Chrome extension package directly"""
    
    # Set up paths
    build_dir = Path("/home/chous/work/semantest/extension.chrome/build")
    package_name = "chatgpt-extension-v2.0.0.zip"
    package_path = Path("/home/chous/work/semantest/extension.chrome") / package_name
    
    print("🚀 Creating ChatGPT Extension v2.0.0 Package")
    print(f"📁 Build directory: {build_dir}")
    print(f"📦 Package target: {package_path}")
    
    # Verify build directory
    if not build_dir.exists():
        raise FileNotFoundError(f"Build directory not found: {build_dir}")
    
    print("✅ Build directory confirmed")
    
    # Remove existing package
    if package_path.exists():
        os.remove(package_path)
        print("🧹 Removed existing package")
    
    # Files to exclude
    exclude_patterns = ['.test.js', '.spec.js', '.map']
    
    # Count files first
    total_files = 0
    included_files = []
    
    for root, dirs, files in os.walk(build_dir):
        for file in files:
            file_path = Path(root) / file
            
            # Check if file should be excluded
            should_exclude = False
            for pattern in exclude_patterns:
                if pattern in file.lower():
                    should_exclude = True
                    break
            
            if not should_exclude:
                rel_path = file_path.relative_to(build_dir)
                included_files.append((file_path, rel_path))
                total_files += 1
    
    print(f"📋 Found {total_files} files to include")
    
    # Create ZIP file
    print("📦 Creating ZIP archive...")
    
    with zipfile.ZipFile(package_path, 'w', zipfile.ZIP_DEFLATED) as zipf:
        for file_path, rel_path in included_files:
            zipf.write(file_path, rel_path)
            print(f"  ✅ Added: {rel_path}")
    
    # Verify package creation
    if not package_path.exists():
        raise RuntimeError("Package was not created successfully")
    
    # Get package statistics
    package_size = package_path.stat().st_size
    size_mb = package_size / (1024 * 1024)
    
    print(f"\n✅ Package created successfully!")
    print(f"📦 Package: {package_name}")
    print(f"📏 Size: {size_mb:.2f}MB ({package_size:,} bytes)")
    print(f"📍 Location: {package_path}")
    print(f"📄 Files: {total_files}")
    
    # Size check
    if size_mb > 100:
        print("⚠️ WARNING: Package exceeds Chrome Web Store 100MB limit!")
        return False
    else:
        print("✅ Package size is within Chrome Web Store limits")
    
    # List package contents
    print("\n📋 Package contents:")
    with zipfile.ZipFile(package_path, 'r') as zipf:
        files = zipf.namelist()
        
        # Show manifest.json first if it exists
        if 'manifest.json' in files:
            print("  📄 manifest.json")
        
        # Show other key files
        key_files = ['background.js', 'content_script.js', 'popup.html', 'popup.js']
        for key_file in key_files:
            if key_file in files:
                print(f"  📄 {key_file}")
        
        # Show assets
        asset_files = [f for f in files if f.startswith('assets/')]
        if asset_files:
            print(f"  📂 assets/ ({len(asset_files)} files)")
        
        # Show other directories
        dirs = set()
        for f in files:
            if '/' in f:
                dirs.add(f.split('/')[0])
        
        for d in sorted(dirs):
            if d != 'assets':
                dir_files = [f for f in files if f.startswith(f"{d}/")]
                print(f"  📂 {d}/ ({len(dir_files)} files)")
    
    print(f"\n🎉 Chrome Extension Package Ready!")
    print(f"🏪 Ready for Chrome Web Store submission")
    print(f"📍 EXACT LOCATION: {package_path}")
    
    return True

# Execute the packaging
if __name__ == "__main__":
    try:
        success = create_package()
        if success:
            print("\n✅ PACKAGING COMPLETED SUCCESSFULLY!")
        else:
            print("\n❌ PACKAGING COMPLETED WITH WARNINGS!")
    except Exception as e:
        print(f"\n❌ PACKAGING FAILED: {e}")
        import traceback
        traceback.print_exc()

# Run it immediately
create_package()