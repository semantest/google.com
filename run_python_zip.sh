#!/bin/bash

# Simple shell script to run Python ZIP creation
echo "🚀 Running Python ZIP creation..."

cd /home/chous/work/semantest/extension.chrome

python3 -c "
import zipfile
from pathlib import Path

# Simple ZIP creation
build_dir = Path('build')
package_path = Path('chatgpt-extension-v2.0.0.zip')

print('📦 Creating package...')

if package_path.exists():
    package_path.unlink()

file_count = 0
with zipfile.ZipFile(package_path, 'w', zipfile.ZIP_DEFLATED) as zipf:
    for file_path in build_dir.rglob('*'):
        if file_path.is_file() and '.test.' not in file_path.name:
            rel_path = file_path.relative_to(build_dir)
            zipf.write(file_path, rel_path)
            file_count += 1

if package_path.exists():
    size_mb = package_path.stat().st_size / (1024 * 1024)
    print(f'✅ SUCCESS: {package_path.absolute()}')
    print(f'📏 Size: {size_mb:.2f}MB')
    print(f'📄 Files: {file_count}')
else:
    print('❌ FAILED!')
"

echo "🔚 Shell script completed."