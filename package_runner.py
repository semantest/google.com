import subprocess
import sys
import os

# Try to execute the zip creation script
try:
    # First try with python3
    result = subprocess.run([
        sys.executable, 
        "/home/chous/work/semantest/google.com/zip_creator.py"
    ], capture_output=True, text=True, cwd="/home/chous/work/semantest/extension.chrome")
    
    print("STDOUT:")
    print(result.stdout)
    
    if result.stderr:
        print("STDERR:")
        print(result.stderr)
        
    print(f"Return code: {result.returncode}")
    
    # Check if the package was created
    package_path = "/home/chous/work/semantest/extension.chrome/chatgpt-extension-v2.0.0.zip"
    if os.path.exists(package_path):
        size = os.path.getsize(package_path)
        print(f"\n✅ Package created successfully!")
        print(f"📦 Location: {package_path}")
        print(f"📏 Size: {size / 1024 / 1024:.2f}MB")
    else:
        print("\n❌ Package not found after execution")
        
except Exception as e:
    print(f"Error running packaging script: {e}")
    
    # Fallback: try to execute the zip creation logic directly
    print("\nTrying direct execution...")
    try:
        exec(open("/home/chous/work/semantest/google.com/zip_creator.py").read())
    except Exception as e2:
        print(f"Direct execution also failed: {e2}")