import zipfile
from pathlib import Path

# Simple ZIP creation
build = Path("/home/chous/work/semantest/extension.chrome/build")
zip_file = Path("/home/chous/work/semantest/extension.chrome/chatgpt-extension-v2.0.0.zip")

# Remove old ZIP if exists
if zip_file.exists():
    zip_file.unlink()

# Create new ZIP
with zipfile.ZipFile(zip_file, 'w', zipfile.ZIP_DEFLATED) as z:
    for file_path in build.rglob('*'):
        if file_path.is_file() and '.test.js' not in str(file_path):
            rel_path = file_path.relative_to(build)
            z.write(file_path, rel_path)

# Print result
print(f"Created: {zip_file}")
print(f"Size: {zip_file.stat().st_size / 1024 / 1024:.2f}MB")