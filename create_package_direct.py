#!/usr/bin/env python3

import zipfile
import os
import sys
from pathlib import Path

def main():
    print("🚀 Creating ChatGPT Extension package...")
    
    # Set paths
    build_dir = Path("/home/chous/work/semantest/extension.chrome/build")
    package_name = "chatgpt-extension-v2.0.0.zip"
    package_path = Path("/home/chous/work/semantest/extension.chrome") / package_name
    
    print(f"📁 Build directory: {build_dir}")
    print(f"📦 Package will be created at: {package_path}")
    
    if not build_dir.exists():
        print("❌ Build directory not found!")
        return False
    
    # Remove existing package
    if package_path.exists():
        try:
            package_path.unlink()
            print(f"🧹 Removed existing {package_name}")
        except Exception as e:
            print(f"⚠️ Could not remove existing package: {e}")
    
    # Files to exclude
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
        path_str = str(file_path).lower()
        for pattern in exclude_patterns:
            if pattern in path_str:
                return True
        return False
    
    # Create ZIP package
    try:
        file_count = 0
        with zipfile.ZipFile(package_path, 'w', zipfile.ZIP_DEFLATED) as zipf:
            for root, dirs, files in os.walk(build_dir):
                for file in files:
                    file_path = Path(root) / file
                    
                    # Skip excluded files
                    if should_exclude(file_path):
                        print(f"  ⏭️  Skipped: {file_path.relative_to(build_dir)}")
                        continue
                    
                    # Calculate relative path from build directory
                    rel_path = file_path.relative_to(build_dir)
                    
                    # Add to ZIP
                    zipf.write(file_path, rel_path)
                    file_count += 1
                    print(f"  ✅ Added: {rel_path}")
        
        print(f"📦 Added {file_count} files to package")
        
    except Exception as e:
        print(f"❌ Error creating ZIP package: {e}")
        return False
    
    # Verify package
    if package_path.exists():
        try:
            size_mb = package_path.stat().st_size / (1024 * 1024)
            print(f"✅ Package created: {package_name}")
            print(f"📏 Size: {size_mb:.2f}MB")
            print(f"📍 Location: {package_path}")
            
            if size_mb > 100:
                print("⚠️  WARNING: Package exceeds Chrome Web Store 100MB limit!")
                return False
            else:
                print("✅ Package size is within Chrome Web Store limits")
            
            # List some package contents
            try:
                with zipfile.ZipFile(package_path, 'r') as zipf:
                    files = zipf.namelist()
                    print(f"\n📋 Package contains {len(files)} files:")
                    for file in sorted(files[:10]):
                        print(f"  📄 {file}")
                    if len(files) > 10:
                        print(f"  ... and {len(files) - 10} more files")
            except Exception as e:
                print(f"⚠️ Could not list package contents: {e}")
            
            print(f"\n🎉 Extension package ready!")
            print(f"📦 Package: {package_name}")
            print(f"📍 Full path: {package_path}")
            print(f"🏪 Ready for Chrome Web Store submission")
            
            return True
        except Exception as e:
            print(f"❌ Error verifying package: {e}")
            return False
    else:
        print("❌ Package creation failed!")
        return False

if __name__ == "__main__":
    success = main()
    if success:
        print("\n✅ Packaging process completed successfully!")
    else:
        print("\n❌ Packaging process failed!")
        sys.exit(1)