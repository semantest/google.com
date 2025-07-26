#!/bin/bash

# All-in-one beta release script
# This combines all release steps for convenience

set -e  # Exit on error

echo "========================================="
echo "Semantest Google Extension"
echo "Complete Beta Release Process"
echo "Version: v1.0.0-beta"
echo "========================================="

# Confirm with user
echo -e "\nThis script will:"
echo "1. Create release branch 'release/v1.0.0-beta'"
echo "2. Update manifest.json to v1.0.0-beta"
echo "3. Create git tag v1.0.0-beta"
echo "4. Generate release package"
echo "5. Push everything to remote"
echo ""
read -p "Continue with beta release? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Release cancelled."
    exit 0
fi

# Step 1: Run the workflow
echo -e "\n=== Running Beta Release Workflow ==="
bash beta_release_workflow.sh

# Check if workflow succeeded
if [ $? -ne 0 ]; then
    echo "❌ Release workflow failed"
    exit 1
fi

# Step 2: Push to remote
echo -e "\n=== Pushing to Remote ==="
read -p "Push branch and tag to remote? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    bash git_beta_push.sh
else
    echo "⚠️  Skipping push. You can run 'bash git_beta_push.sh' later."
fi

# Step 3: Create GitHub release
echo -e "\n=== GitHub Release ==="
echo "To create GitHub release, you can either:"
echo "1. Run: bash github_beta_release.sh"
echo "2. Visit: https://github.com/semantest/workspace/releases/new"
echo "   - Choose tag: v1.0.0-beta"
echo "   - Upload: chatgpt-extension-v1.0.0-beta.zip"
echo "   - Mark as pre-release"

# Summary
echo -e "\n========================================="
echo "Beta Release Process Complete!"
echo "========================================="
echo "✅ Branch: release/v1.0.0-beta"
echo "✅ Tag: v1.0.0-beta"
echo "✅ Package: chatgpt-extension-v1.0.0-beta.zip"
echo ""
echo "See BETA_RELEASE_CHECKLIST.md for next steps"
echo "========================================="