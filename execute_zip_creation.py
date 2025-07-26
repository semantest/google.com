import zipfile
import os
from pathlib import Path

# Execute the packaging process
build_dir = Path("/home/chous/work/semantest/extension.chrome/build")
package_name = "chatgpt-extension-v2.0.0.zip"
package_path = Path("/home/chous/work/semantest/extension.chrome") / package_name

# Ensure build directory exists
assert build_dir.exists(), "Build directory not found"

# Remove existing package if it exists
if package_path.exists():
    package_path.unlink()

# Create the ZIP file
with zipfile.ZipFile(package_path, 'w', zipfile.ZIP_DEFLATED) as zipf:
    for root, dirs, files in os.walk(build_dir):
        for file in files:
            file_path = Path(root) / file
            rel_path = file_path.relative_to(build_dir)
            
            # Skip test files and other unwanted files
            if any(pattern in str(file_path).lower() for pattern in ['.test.js', '.spec.js', '.md']):
                continue
                
            zipf.write(file_path, rel_path)

# Verify package was created
assert package_path.exists(), "Package was not created"

# Get package info
size_bytes = package_path.stat().st_size
size_mb = size_bytes / (1024 * 1024)

print(f"Package created: {package_path}")
print(f"Size: {size_mb:.2f}MB")

# Store results
RESULT = {
    'path': str(package_path),
    'size_mb': size_mb,
    'exists': package_path.exists()
}