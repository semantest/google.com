#!/usr/bin/env python3

# Execute packaging code directly using exec
print("🚀 Executing packaging using exec method...")

packaging_code = '''
import zipfile
from pathlib import Path

# Packaging execution
build_dir = Path("/home/chous/work/semantest/extension.chrome/build")
package_path = Path("/home/chous/work/semantest/extension.chrome/chatgpt-extension-v2.0.0.zip")

print("📦 Creating package...")
print(f"📁 Build: {build_dir}")
print(f"📦 Package: {package_path}")

# Remove old package
if package_path.exists():
    package_path.unlink()
    print("🧹 Removed old package")

# Create ZIP
file_count = 0
with zipfile.ZipFile(package_path, 'w', zipfile.ZIP_DEFLATED) as zipf:
    for file_path in build_dir.rglob('*'):
        if file_path.is_file() and '.test.' not in file_path.name:
            rel_path = file_path.relative_to(build_dir)
            zipf.write(file_path, rel_path)
            file_count += 1

print(f"📦 Added {file_count} files")

# Verify
if package_path.exists():
    size_mb = package_path.stat().st_size / (1024 * 1024)
    print(f"✅ SUCCESS!")
    print(f"📦 Package: {package_path}")
    print(f"📏 Size: {size_mb:.2f}MB")
    
    # Export results
    RESULT_PATH = str(package_path)
    RESULT_SIZE = size_mb
    SUCCESS = True
else:
    print("❌ FAILED!")
    RESULT_PATH = None
    RESULT_SIZE = 0
    SUCCESS = False
'''

# Execute the packaging code
try:
    exec(packaging_code)
    print("✅ Packaging code executed successfully")
    
    # Check if variables were set
    if 'SUCCESS' in locals() and SUCCESS:
        print(f"📍 Package location: {RESULT_PATH}")
        print(f"📏 Package size: {RESULT_SIZE:.2f}MB")
    else:
        print("❌ Packaging failed")
        
except Exception as e:
    print(f"❌ Error executing packaging code: {e}")
    import traceback
    traceback.print_exc()

print("🔚 Execution completed.")