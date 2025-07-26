#!/usr/bin/env python3

print("Executing ZIP creation via exec...")

try:
    # Execute the manual zip creation code
    exec(open('/home/chous/work/semantest/google.com/manual_zip.py').read())
    print("✅ ZIP creation executed successfully")
except Exception as e:
    print(f"❌ Error executing ZIP creation: {e}")
    import traceback
    traceback.print_exc()

print("Exec wrapper completed.")