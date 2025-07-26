import subprocess
import sys
import os

print("Attempting to execute packaging script...")

# Try different execution methods
methods = [
    # Method 1: Direct subprocess
    lambda: subprocess.run([sys.executable, "/home/chous/work/semantest/google.com/simple_packager.py"], 
                          capture_output=True, text=True),
    
    # Method 2: os.system
    lambda: os.system(f"{sys.executable} /home/chous/work/semantest/google.com/simple_packager.py"),
    
    # Method 3: exec
    lambda: exec(open("/home/chous/work/semantest/google.com/simple_packager.py").read())
]

for i, method in enumerate(methods, 1):
    try:
        print(f"\nTrying method {i}...")
        result = method()
        print(f"Method {i} result: {result}")
        
        # Check if package was created
        package_path = "/home/chous/work/semantest/extension.chrome/chatgpt-extension-v2.0.0.zip"
        if os.path.exists(package_path):
            size = os.path.getsize(package_path) / 1024 / 1024
            print(f"✅ SUCCESS! Package created: {size:.2f}MB")
            print(f"📍 Location: {package_path}")
            break
        else:
            print(f"❌ Method {i} failed - no package found")
            
    except Exception as e:
        print(f"❌ Method {i} failed: {e}")
        continue

else:
    print("\n❌ All methods failed. Trying inline execution...")
    
    # Direct inline execution as last resort
    try:
        import zipfile
        from pathlib import Path
        
        build_dir = Path("/home/chous/work/semantest/extension.chrome/build")
        package_path = Path("/home/chous/work/semantest/extension.chrome/chatgpt-extension-v2.0.0.zip")
        
        if package_path.exists():
            package_path.unlink()
        
        with zipfile.ZipFile(package_path, 'w') as z:
            for f in build_dir.rglob('*'):
                if f.is_file() and '.test.' not in f.name:
                    z.write(f, f.relative_to(build_dir))
        
        if package_path.exists():
            size = package_path.stat().st_size / 1024 / 1024
            print(f"✅ Inline execution SUCCESS!")
            print(f"📦 Package: {package_path}")
            print(f"📏 Size: {size:.2f}MB")
        else:
            print("❌ Inline execution failed")
            
    except Exception as e:
        print(f"❌ Inline execution failed: {e}")

print("\nExecution attempts completed.")