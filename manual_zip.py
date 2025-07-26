#!/usr/bin/env python3

# Manual ZIP creation approach
import zipfile
from pathlib import Path

# Define paths
BUILD_DIR = "/home/chous/work/semantest/extension.chrome/build"
PACKAGE_PATH = "/home/chous/work/semantest/extension.chrome/chatgpt-extension-v2.0.0.zip"

print("Starting manual ZIP creation...")

# Create the ZIP file
with zipfile.ZipFile(PACKAGE_PATH, 'w', zipfile.ZIP_DEFLATED) as zipf:
    
    # Add manifest.json
    zipf.write(f"{BUILD_DIR}/manifest.json", "manifest.json")
    print("✅ Added manifest.json")
    
    # Add main JS files
    main_files = [
        "background.js",
        "content_script.js", 
        "popup.js",
        "storage.js",
        "advanced-training.js",
        "chatgpt-background.js",
        "pattern-manager.js",
        "performance-optimizer.js",
        "pattern-health-monitor.js",
        "time-travel-ui.js",
        "training-ui.js",
        "message-store.js"
    ]
    
    for file in main_files:
        file_path = f"{BUILD_DIR}/{file}"
        if Path(file_path).exists():
            zipf.write(file_path, file)
            print(f"✅ Added {file}")
    
    # Add HTML files
    html_files = ["popup.html", "devtools.html", "panel.html"]
    for file in html_files:
        file_path = f"{BUILD_DIR}/{file}"
        if Path(file_path).exists():
            zipf.write(file_path, file)
            print(f"✅ Added {file}")
    
    # Add assets directory
    assets_dir = Path(f"{BUILD_DIR}/assets")
    if assets_dir.exists():
        for asset_file in assets_dir.iterdir():
            if asset_file.is_file():
                zipf.write(str(asset_file), f"assets/{asset_file.name}")
                print(f"✅ Added assets/{asset_file.name}")
    
    # Add other directories
    for subdir in ["contracts", "downloads", "plugins", "shared", "training"]:
        subdir_path = Path(f"{BUILD_DIR}/{subdir}")
        if subdir_path.exists():
            for root, dirs, files in subdir_path.rglob("*"):
                for file in files:
                    if not file.endswith(('.test.js', '.spec.js')):
                        file_path = Path(root) / file
                        rel_path = file_path.relative_to(Path(BUILD_DIR))
                        zipf.write(str(file_path), str(rel_path))
                        print(f"✅ Added {rel_path}")

print("ZIP creation completed!")

# Verify package
package_path = Path(PACKAGE_PATH)
if package_path.exists():
    size_mb = package_path.stat().st_size / (1024 * 1024)
    print(f"📦 Package: {PACKAGE_PATH}")
    print(f"📏 Size: {size_mb:.2f}MB")
else:
    print("❌ Package not created!")

RESULT_PATH = PACKAGE_PATH