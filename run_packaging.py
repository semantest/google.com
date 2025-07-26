#!/usr/bin/env python3

import sys
import os
import subprocess

# Add the parent directory to the path so we can run the packaging script
script_path = '/home/chous/work/semantest/extension.chrome/create_package.py'

try:
    # Change to the extension directory
    os.chdir('/home/chous/work/semantest/extension.chrome')
    
    # Execute the packaging script
    result = subprocess.run([sys.executable, script_path], 
                          capture_output=True, text=True)
    
    print("STDOUT:")
    print(result.stdout)
    
    if result.stderr:
        print("STDERR:")
        print(result.stderr)
    
    print(f"Return code: {result.returncode}")
    
except Exception as e:
    print(f"Error executing packaging script: {e}")