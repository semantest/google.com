#!/usr/bin/env python3

# Execute the packaging code directly
print("Starting Chrome Extension packaging process...")

try:
    exec(open('/home/chous/work/semantest/google.com/package_creator.py').read())
    print("✅ Packaging completed successfully!")
except Exception as e:
    print(f"❌ Error during packaging: {e}")
    import traceback
    traceback.print_exc()