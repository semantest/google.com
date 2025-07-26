import zipfile
import os
from pathlib import Path

# Direct execution - no functions, just immediate code
print("🚀 Creating ChatGPT Extension v2.0.0 Package")

build_dir = Path("/home/chous/work/semantest/extension.chrome/build")
package_path = Path("/home/chous/work/semantest/extension.chrome/chatgpt-extension-v2.0.0.zip")

# Remove old package
if package_path.exists():
    package_path.unlink()

# Create new package
file_count = 0
with zipfile.ZipFile(package_path, 'w', zipfile.ZIP_DEFLATED) as zipf:
    for root, dirs, files in os.walk(build_dir):
        for file in files:
            if '.test.js' not in file and '.spec.js' not in file:
                file_path = Path(root) / file
                rel_path = file_path.relative_to(build_dir)
                zipf.write(file_path, rel_path)
                file_count += 1

# Check result
if package_path.exists():
    size_mb = package_path.stat().st_size / (1024 * 1024)
    print(f"✅ SUCCESS: {package_path}")
    print(f"📏 Size: {size_mb:.2f}MB")
    print(f"📄 Files: {file_count}")
else:
    print("❌ FAILED")

PACKAGE_LOCATION = str(package_path)
PACKAGE_SIZE = size_mb
SUCCESS = package_path.exists()