import zipfile
import os
from pathlib import Path

# Immediate execution
source_dir = Path("/home/chous/work/semantest/google.com")
zip_path = source_dir / "chatgpt-extension-v1.0.0.zip"

print("🚀 Creating package immediately...")

# Remove existing zip if present
if zip_path.exists():
    os.remove(zip_path)

# Create new zip
with zipfile.ZipFile(zip_path, 'w', zipfile.ZIP_DEFLATED) as z:
    # Add manifest
    manifest = source_dir / "manifest.json"
    if manifest.exists():
        z.write(manifest, "manifest.json")
        print("Added manifest.json")
    
    # Add package.json
    package = source_dir / "package.json"
    if package.exists():
        z.write(package, "package.json")
        print("Added package.json")
    
    # Add TypeScript config
    tsconfig = source_dir / "tsconfig.json"
    if tsconfig.exists():
        z.write(tsconfig, "tsconfig.json")
        print("Added tsconfig.json")
    
    # Add source files
    src = source_dir / "src"
    if src.exists():
        for file_path in src.rglob("*"):
            if file_path.is_file() and file_path.suffix == ".ts":
                arc_path = file_path.relative_to(source_dir)
                z.write(file_path, arc_path)
                print(f"Added {arc_path}")
    
    # Add test files
    tests = source_dir / "tests"
    if tests.exists():
        for file_path in tests.rglob("*"):
            if file_path.is_file() and file_path.suffix == ".ts":
                arc_path = file_path.relative_to(source_dir)
                z.write(file_path, arc_path)
                print(f"Added {arc_path}")
    
    # Add README files
    readme_org = source_dir / "README.org"
    if readme_org.exists():
        z.write(readme_org, "README.org")
        print("Added README.org")
    
    readme_images = source_dir / "README-IMAGES.md"
    if readme_images.exists():
        z.write(readme_images, "README-IMAGES.md")
        print("Added README-IMAGES.md")

# Check final result
if zip_path.exists():
    size = zip_path.stat().st_size / 1024 / 1024
    print(f"\n✅ Package created successfully!")
    print(f"📦 Location: {zip_path}")
    print(f"📏 Size: {size:.2f} MB")
    
    # List contents
    with zipfile.ZipFile(zip_path, 'r') as z:
        files = z.namelist()
        print(f"📋 Contains {len(files)} files")
        for f in sorted(files):
            print(f"  • {f}")

print("\n🎉 Package creation completed!")