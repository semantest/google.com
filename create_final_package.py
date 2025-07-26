#!/usr/bin/env python3

"""
Final Package Creation for chatgpt-extension-v1.0.0.zip
"""

import os
import zipfile
from pathlib import Path

def create_final_package():
    """Create the final extension package"""
    
    # Define paths
    source_dir = Path("/home/chous/work/semantest/google.com")
    package_name = "chatgpt-extension-v1.0.0.zip"
    package_path = source_dir / package_name
    
    print("🚀 Creating Final Extension Package v1.0.0")
    print(f"📁 Source: {source_dir}")
    print(f"📦 Target: {package_path}")
    
    # Remove existing package
    if package_path.exists():
        package_path.unlink()
        print("🧹 Removed existing package")
    
    # Files and directories to include
    include_patterns = [
        "manifest.json",
        "package.json",
        "tsconfig.json",
        "src/**/*.ts",
        "tests/**/*.ts",
        "README.org",
        "*.md"
    ]
    
    # Files to exclude
    exclude_patterns = [
        "*.py",
        "*.sh", 
        "node_modules/",
        ".git/",
        "dist/",
        "build/",
        "__pycache__/",
        "*.pyc"
    ]
    
    file_count = 0
    excluded_count = 0
    
    with zipfile.ZipFile(package_path, 'w', zipfile.ZIP_DEFLATED) as zipf:
        
        # Add manifest.json
        manifest_path = source_dir / "manifest.json"
        if manifest_path.exists():
            zipf.write(manifest_path, "manifest.json")
            file_count += 1
            print(f"  ✅ manifest.json")
        
        # Add package.json
        package_json_path = source_dir / "package.json"
        if package_json_path.exists():
            zipf.write(package_json_path, "package.json")
            file_count += 1
            print(f"  ✅ package.json")
        
        # Add tsconfig.json
        tsconfig_path = source_dir / "tsconfig.json"
        if tsconfig_path.exists():
            zipf.write(tsconfig_path, "tsconfig.json")
            file_count += 1
            print(f"  ✅ tsconfig.json")
        
        # Add all TypeScript files from src/
        src_dir = source_dir / "src"
        if src_dir.exists():
            for ts_file in src_dir.rglob("*.ts"):
                rel_path = ts_file.relative_to(source_dir)
                zipf.write(ts_file, rel_path)
                file_count += 1
                print(f"  ✅ {rel_path}")
        
        # Add test files
        tests_dir = source_dir / "tests"
        if tests_dir.exists():
            for test_file in tests_dir.rglob("*.ts"):
                rel_path = test_file.relative_to(source_dir)
                zipf.write(test_file, rel_path)
                file_count += 1
                print(f"  ✅ {rel_path}")
        
        # Add README files
        for readme_file in source_dir.glob("README*"):
            if readme_file.is_file():
                rel_path = readme_file.relative_to(source_dir)
                zipf.write(readme_file, rel_path)
                file_count += 1
                print(f"  ✅ {rel_path}")
        
        # Add markdown files
        for md_file in source_dir.glob("*.md"):
            if md_file.is_file():
                rel_path = md_file.relative_to(source_dir)
                zipf.write(md_file, rel_path)
                file_count += 1
                print(f"  ✅ {rel_path}")
        
        # Add playwright config
        playwright_config = source_dir / "playwright.config.ts"
        if playwright_config.exists():
            zipf.write(playwright_config, "playwright.config.ts")
            file_count += 1
            print(f"  ✅ playwright.config.ts")
    
    print(f"📦 Added {file_count} files to package")
    
    # Verify package
    if package_path.exists():
        size_bytes = package_path.stat().st_size
        size_mb = size_bytes / (1024 * 1024)
        
        print(f"\n✅ Package created successfully!")
        print(f"📦 Name: {package_name}")
        print(f"📏 Size: {size_mb:.2f}MB ({size_bytes:,} bytes)")
        print(f"📍 Location: {package_path}")
        
        # List package contents
        with zipfile.ZipFile(package_path, 'r') as zipf:
            files = zipf.namelist()
            print(f"\n📋 Package contains {len(files)} files:")
            
            # Group by type
            manifests = [f for f in files if f == 'manifest.json']
            configs = [f for f in files if f.endswith('.json') or f.endswith('.ts') and '/' not in f]
            source_files = [f for f in files if f.startswith('src/')]
            test_files = [f for f in files if f.startswith('tests/')]
            docs = [f for f in files if f.endswith('.md') or f.endswith('.org')]
            
            if manifests:
                print(f"  📄 Manifest: {len(manifests)} file(s)")
                for f in manifests:
                    print(f"    • {f}")
            
            if configs:
                print(f"  ⚙️  Config files: {len(configs)} file(s)")
                for f in configs:
                    print(f"    • {f}")
            
            if source_files:
                print(f"  💻 Source files: {len(source_files)} file(s)")
                for f in source_files[:5]:  # Show first 5
                    print(f"    • {f}")
                if len(source_files) > 5:
                    print(f"    • ... and {len(source_files) - 5} more")
            
            if test_files:
                print(f"  🧪 Test files: {len(test_files)} file(s)")
                for f in test_files:
                    print(f"    • {f}")
            
            if docs:
                print(f"  📚 Documentation: {len(docs)} file(s)")
                for f in docs:
                    print(f"    • {f}")
        
        return str(package_path), size_mb
    
    else:
        raise RuntimeError("Package creation failed")

if __name__ == "__main__":
    try:
        package_path, size_mb = create_final_package()
        
        print(f"\n" + "="*60)
        print("🎉 FINAL PACKAGE CREATION COMPLETED!")
        print("="*60)
        print(f"📦 Package: {package_path}")
        print(f"📏 Size: {size_mb:.2f}MB")
        print("✅ Ready for Chrome Web Store submission")
        
    except Exception as e:
        print(f"\n❌ Package creation failed: {e}")
        import traceback
        traceback.print_exc()