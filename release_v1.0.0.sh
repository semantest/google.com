#!/bin/bash

# Release script for v1.0.0
echo "=== Starting v1.0.0 Release Process ==="

# Step 1: Check git status
echo "Step 1: Checking git status..."
git status

# Step 2: Create and push git tag v1.0.0
echo "Step 2: Creating git tag v1.0.0..."
git tag v1.0.0
echo "Pushing tag to remote..."
git push origin v1.0.0

# Step 3: Show current version
echo "Step 3: Current package.json version:"
grep '"version"' package.json

echo "=== Release process completed ==="
echo "Tag v1.0.0 has been created and pushed"
echo "Package.json version: $(grep '"version"' package.json | cut -d'"' -f4)"