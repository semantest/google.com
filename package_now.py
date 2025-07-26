#!/usr/bin/env python3
import zipfile
import os
from pathlib import Path

# Create the package
source_dir = Path("/home/chous/work/semantest/google.com")
package_path = source_dir / "chatgpt-extension-v1.0.0.zip"

# Remove existing
if package_path.exists():
    package_path.unlink()

print("Creating extension package...")

with zipfile.ZipFile(package_path, 'w', zipfile.ZIP_DEFLATED) as zipf:
    
    # Add manifest.json
    manifest = source_dir / "manifest.json"
    if manifest.exists():
        zipf.write(manifest, "manifest.json")
        print("✅ Added manifest.json")
    
    # Add package.json
    pkg = source_dir / "package.json"
    if pkg.exists():
        zipf.write(pkg, "package.json")
        print("✅ Added package.json")
    
    # Add tsconfig.json
    tsc = source_dir / "tsconfig.json"
    if tsc.exists():
        zipf.write(tsc, "tsconfig.json")
        print("✅ Added tsconfig.json")
    
    # Add src directory
    src_dir = source_dir / "src"
    if src_dir.exists():
        for root, dirs, files in os.walk(src_dir):
            for file in files:
                if file.endswith('.ts'):
                    file_path = Path(root) / file
                    rel_path = file_path.relative_to(source_dir)
                    zipf.write(file_path, rel_path)
                    print(f"✅ Added {rel_path}")
    
    # Add tests directory
    tests_dir = source_dir / "tests"
    if tests_dir.exists():
        for root, dirs, files in os.walk(tests_dir):
            for file in files:
                if file.endswith('.ts'):
                    file_path = Path(root) / file
                    rel_path = file_path.relative_to(source_dir)
                    zipf.write(file_path, rel_path)
                    print(f"✅ Added {rel_path}")
    
    # Add README files
    for readme in ["README.org", "README-IMAGES.md"]:
        readme_path = source_dir / readme
        if readme_path.exists():
            zipf.write(readme_path, readme)
            print(f"✅ Added {readme}")
    
    # Add markdown files
    for md_file in source_dir.glob("*.md"):
        if md_file.is_file() and not md_file.name.startswith("README"):
            zipf.write(md_file, md_file.name)
            print(f"✅ Added {md_file.name}")

# Check result
if package_path.exists():
    size = package_path.stat().st_size
    print(f"\n✅ Package created: {package_path}")
    print(f"📏 Size: {size / 1024 / 1024:.2f}MB")
else:
    print("❌ Package creation failed")

print("Package creation completed!")
exec(open(__file__).read())