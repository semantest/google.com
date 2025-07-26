import zipfile
import os
from pathlib import Path

# Execute package creation immediately
version = "1.0.0-beta"
package_name = f"chatgpt-extension-v{version}.zip"
build_dir = Path("/home/chous/work/semantest/extension.chrome/build")
package_path = Path("/home/chous/work/semantest/google.com") / package_name

# Remove existing file
if package_path.exists():
    os.remove(package_path)

# Essential files
essential_files = {
    'manifest.json',
    'chatgpt-controller.js',
    'service-worker.js',
    'popup.html',
    'popup.js',
    'background.js',
    'content_script.js',
    'storage.js'
}

# Create ZIP package
with zipfile.ZipFile(package_path, 'w', zipfile.ZIP_DEFLATED) as zipf:
    file_count = 0
    for root, dirs, files in os.walk(build_dir):
        for file in files:
            file_path = Path(root) / file
            rel_path = file_path.relative_to(build_dir)
            
            if file in essential_files or 'assets' in str(rel_path):
                zipf.write(file_path, rel_path)
                file_count += 1

# Output results
print(f"✅ BETA Package created: {package_name}")
print(f"📍 Exact location: {package_path.absolute()}")
print(f"📦 Files included: {file_count}")
print(f"📏 Size: {os.path.getsize(package_path) / 1024:.2f} KB")

# Write status file
with open("/home/chous/work/semantest/google.com/package_status.txt", "w") as f:
    f.write(f"Package created: {package_path.absolute()}\n")
    f.write(f"Size: {os.path.getsize(package_path)} bytes\n")
    f.write(f"Files: {file_count}\n")