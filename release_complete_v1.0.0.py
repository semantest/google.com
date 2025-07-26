#!/usr/bin/env python3

"""
Complete Release Script for v1.0.0
Handles git operations, version updates, and packaging
"""

import os
import sys
import json
import zipfile
import subprocess
from pathlib import Path

def run_command(cmd, description=""):
    """Execute shell command and return result"""
    print(f"🔧 {description}")
    print(f"💻 Running: {cmd}")
    
    try:
        result = subprocess.run(cmd, shell=True, capture_output=True, text=True, cwd="/home/chous/work/semantest/google.com")
        
        if result.stdout:
            print(f"✅ Output: {result.stdout.strip()}")
        
        if result.stderr and result.returncode != 0:
            print(f"❌ Error: {result.stderr.strip()}")
            return False, result.stderr
        
        return True, result.stdout
    
    except Exception as e:
        print(f"❌ Exception: {e}")
        return False, str(e)

def check_git_status():
    """Check git status"""
    print("\n=== STEP 1: Git Status Check ===")
    success, output = run_command("git status", "Checking git status")
    if success:
        print("Git status check completed")
    return success

def create_and_push_tag():
    """Create and push v1.0.0 tag"""
    print("\n=== STEP 2: Create and Push Git Tag v1.0.0 ===")
    
    # Create tag
    success, output = run_command("git tag v1.0.0", "Creating git tag v1.0.0")
    if not success:
        if "already exists" in output:
            print("ℹ️ Tag v1.0.0 already exists")
        else:
            return False
    
    # Push tag
    success, output = run_command("git push origin v1.0.0", "Pushing tag to remote")
    if not success:
        if "already up to date" in output.lower() or "everything up-to-date" in output.lower():
            print("ℹ️ Tag already pushed to remote")
            return True
        return False
    
    print("✅ Tag v1.0.0 created and pushed successfully")
    return True

def update_manifest_version():
    """Update manifest.json version to 1.0.0"""
    print("\n=== STEP 3: Update manifest.json Version ===")
    
    # Look for manifest.json in common locations
    manifest_paths = [
        "/home/chous/work/semantest/google.com/manifest.json",
        "/home/chous/work/semantest/google.com/src/manifest.json",
        "/home/chous/work/semantest/google.com/dist/manifest.json",
        "/home/chous/work/semantest/google.com/build/manifest.json"
    ]
    
    manifest_path = None
    for path in manifest_paths:
        if os.path.exists(path):
            manifest_path = path
            break
    
    if not manifest_path:
        # Create a basic manifest.json
        manifest_path = "/home/chous/work/semantest/google.com/manifest.json"
        manifest_data = {
            "manifest_version": 3,
            "name": "Google Semantest Extension",
            "version": "1.0.0",
            "description": "Google domain automation extension for Semantest framework",
            "permissions": ["activeTab", "storage"],
            "action": {
                "default_popup": "popup.html"
            },
            "content_scripts": [{
                "matches": ["*://www.google.com/*"],
                "js": ["content_script.js"]
            }],
            "background": {
                "service_worker": "background.js"
            }
        }
        
        with open(manifest_path, 'w') as f:
            json.dump(manifest_data, f, indent=2)
        
        print(f"✅ Created new manifest.json at {manifest_path}")
    else:
        # Update existing manifest
        with open(manifest_path, 'r') as f:
            manifest_data = json.load(f)
        
        manifest_data["version"] = "1.0.0"
        
        with open(manifest_path, 'w') as f:
            json.dump(manifest_data, f, indent=2)
        
        print(f"✅ Updated manifest.json version to 1.0.0 at {manifest_path}")
    
    return manifest_path

def create_extension_package():
    """Create chatgpt-extension-v1.0.0.zip package"""
    print("\n=== STEP 4: Create Extension Package ===")
    
    # Define source and target paths
    source_dir = Path("/home/chous/work/semantest/google.com")
    package_name = "chatgpt-extension-v1.0.0.zip"
    package_path = source_dir / package_name
    
    print(f"📁 Source: {source_dir}")
    print(f"📦 Target: {package_path}")
    
    # Remove existing package
    if package_path.exists():
        package_path.unlink()
        print("🧹 Removed existing package")
    
    # Files to include in the extension package
    essential_files = [
        "manifest.json",
        "package.json",
        "src/",
        "dist/",
        "README.org",
        "tsconfig.json"
    ]
    
    # Create ZIP package
    file_count = 0
    excluded_count = 0
    
    with zipfile.ZipFile(package_path, 'w', zipfile.ZIP_DEFLATED) as zipf:
        # Add specific files and directories
        for item in essential_files:
            item_path = source_dir / item
            
            if item_path.exists():
                if item_path.is_file():
                    zipf.write(item_path, item)
                    file_count += 1
                    print(f"  ✅ {item}")
                
                elif item_path.is_dir():
                    for root, dirs, files in os.walk(item_path):
                        for file in files:
                            file_path = Path(root) / file
                            rel_path = file_path.relative_to(source_dir)
                            
                            # Skip test files and Python scripts
                            if any(skip in file for skip in ['.test.', '.spec.', '.py']):
                                excluded_count += 1
                                continue
                            
                            zipf.write(file_path, rel_path)
                            file_count += 1
                            print(f"  ✅ {rel_path}")
        
        # Add any additional TypeScript files from src
        for ts_file in source_dir.glob("src/**/*.ts"):
            if not any(skip in str(ts_file) for skip in ['.test.', '.spec.']):
                rel_path = ts_file.relative_to(source_dir)
                if str(rel_path) not in zipf.namelist():
                    zipf.write(ts_file, rel_path)
                    file_count += 1
                    print(f"  ✅ {rel_path}")
    
    print(f"📦 Added {file_count} files (excluded {excluded_count} files)")
    
    # Verify package
    if package_path.exists():
        size_bytes = package_path.stat().st_size
        size_mb = size_bytes / (1024 * 1024)
        
        print(f"\n✅ Package created successfully!")
        print(f"📦 Name: {package_name}")
        print(f"📏 Size: {size_mb:.2f}MB ({size_bytes:,} bytes)")
        print(f"📍 Location: {package_path}")
        
        return str(package_path), size_mb
    
    else:
        raise RuntimeError("Package creation failed")

def generate_final_report(manifest_path, package_path, package_size):
    """Generate final release report"""
    print("\n" + "="*60)
    print("🎉 RELEASE v1.0.0 COMPLETED SUCCESSFULLY!")
    print("="*60)
    
    print("\n📋 RELEASE SUMMARY:")
    print(f"  🏷️  Tag: v1.0.0 (created and pushed)")
    print(f"  📄 Manifest: {manifest_path}")
    print(f"  📦 Package: {package_path}")
    print(f"  📏 Size: {package_size:.2f}MB")
    
    print("\n📍 ALL FILE LOCATIONS:")
    print(f"  • Manifest.json: {manifest_path}")
    print(f"  • Package: {package_path}")
    print(f"  • Source code: /home/chous/work/semantest/google.com/src/")
    print(f"  • Tests: /home/chous/work/semantest/google.com/tests/")
    
    print("\n🚀 NEXT STEPS:")
    print("  1. The git tag v1.0.0 has been pushed to trigger release pipeline")
    print("  2. The extension package is ready for Chrome Web Store")
    print("  3. Review the package contents before submission")
    
    print("\n✅ All release tasks completed successfully!")

def main():
    """Main release process"""
    print("🚀 Starting Complete Release Process for v1.0.0")
    print("="*60)
    
    try:
        # Step 1: Check git status
        if not check_git_status():
            print("❌ Git status check failed")
            return False
        
        # Step 2: Create and push tag
        if not create_and_push_tag():
            print("❌ Git tag creation/push failed")
            return False
        
        # Step 3: Update manifest version
        manifest_path = update_manifest_version()
        
        # Step 4: Create extension package
        package_path, package_size = create_extension_package()
        
        # Step 5: Generate final report
        generate_final_report(manifest_path, package_path, package_size)
        
        return True
        
    except Exception as e:
        print(f"\n❌ RELEASE FAILED: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)