#!/usr/bin/env python3

import zipfile
import os
from pathlib import Path

# Define package details
version = "1.0.0-beta"
package_name = f"chatgpt-extension-v{version}.zip"
build_dir = Path("/home/chous/work/semantest/extension.chrome/build")
package_path = Path("/home/chous/work/semantest/google.com") / package_name

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
    for root, dirs, files in os.walk(build_dir):
        for file in files:
            file_path = Path(root) / file
            rel_path = file_path.relative_to(build_dir)
            
            if file in essential_files or 'assets' in str(rel_path):
                zipf.write(file_path, rel_path)

print(f"Package created: {package_path}")