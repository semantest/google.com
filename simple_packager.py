import zipfile
from pathlib import Path

# Minimal ZIP creation
build = Path("/home/chous/work/semantest/extension.chrome/build")
package = Path("/home/chous/work/semantest/extension.chrome/chatgpt-extension-v2.0.0.zip")

# Remove old package
if package.exists():
    package.unlink()

# Create ZIP
with zipfile.ZipFile(package, 'w') as z:
    # Add all files except test files
    for f in build.rglob('*'):
        if f.is_file() and '.test.' not in f.name:
            z.write(f, f.relative_to(build))

# Check result
size = package.stat().st_size / 1024 / 1024
print(f"Package: {package}")
print(f"Size: {size:.2f}MB")
print("✅ DONE")