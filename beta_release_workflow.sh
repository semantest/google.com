#!/bin/bash

# Beta Release Workflow for Semantest Google Extension v1.0.0-beta
# This script handles the complete beta release process

set -e  # Exit on error

echo "========================================="
echo "Semantest Google Extension Beta Release"
echo "Version: v1.0.0-beta"
echo "========================================="

# Step 1: Ensure we're in the correct directory
echo -e "\n[Step 1] Verifying directory..."
cd /home/chous/work/semantest/google.com
echo "✓ Working in: $(pwd)"

# Step 2: Check git status
echo -e "\n[Step 2] Checking git status..."
git status --short
if [ -n "$(git status --porcelain)" ]; then
    echo "⚠️  Warning: You have uncommitted changes"
    read -p "Do you want to continue? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "❌ Release cancelled"
        exit 1
    fi
fi

# Step 3: Get current branch
CURRENT_BRANCH=$(git branch --show-current)
echo -e "\n[Step 3] Current branch: $CURRENT_BRANCH"

# Step 4: Create beta release branch
BETA_BRANCH="release/v1.0.0-beta"
echo -e "\n[Step 4] Creating beta release branch..."
if git show-ref --verify --quiet refs/heads/$BETA_BRANCH; then
    echo "⚠️  Branch $BETA_BRANCH already exists"
    read -p "Do you want to switch to it? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        git checkout $BETA_BRANCH
    else
        echo "❌ Release cancelled"
        exit 1
    fi
else
    git checkout -b $BETA_BRANCH
    echo "✓ Created and switched to branch: $BETA_BRANCH"
fi

# Step 5: Update manifest.json version to beta
echo -e "\n[Step 5] Updating manifest.json version..."
sed -i 's/"version": "1.0.0"/"version": "1.0.0-beta"/' manifest.json
echo "✓ Updated manifest.json to version 1.0.0-beta"

# Step 6: Commit version change
echo -e "\n[Step 6] Committing version change..."
git add manifest.json
git commit -m "chore: update manifest version to 1.0.0-beta for beta release

- Updated manifest.json version from 1.0.0 to 1.0.0-beta
- Preparing for beta release testing

🤖 Generated with [Claude Code](https://claude.ai/code)

Co-Authored-By: Claude <noreply@anthropic.com>"

echo "✓ Committed version change"

# Step 7: Create annotated tag
echo -e "\n[Step 7] Creating annotated tag v1.0.0-beta..."
git tag -a v1.0.0-beta -m "Beta Release v1.0.0-beta

Features:
- Google Search automation with TypeScript-EDA architecture
- Google Images download functionality
- Event-driven domain model
- Clean architecture implementation
- Comprehensive test coverage

This is a beta release for testing and feedback.

Components:
- Domain layer with entities and value objects
- Application layer with use cases
- Infrastructure layer with adapters
- Full TypeScript support
- Jest testing framework

Please report any issues to the Semantest team."

echo "✓ Created tag v1.0.0-beta"

# Step 8: Show tag info
echo -e "\n[Step 8] Tag information:"
git show v1.0.0-beta --no-patch

# Step 9: Create extension package
echo -e "\n[Step 9] Creating extension package..."
python3 create_beta_package.py
if [ -f "chatgpt-extension-v1.0.0-beta.zip" ]; then
    echo "✓ Package created: chatgpt-extension-v1.0.0-beta.zip"
    echo "  Size: $(du -h chatgpt-extension-v1.0.0-beta.zip | cut -f1)"
else
    echo "❌ Failed to create package"
    exit 1
fi

# Step 10: Create release artifacts directory
echo -e "\n[Step 10] Organizing release artifacts..."
RELEASE_DIR="releases/v1.0.0-beta"
mkdir -p $RELEASE_DIR
cp chatgpt-extension-v1.0.0-beta.zip $RELEASE_DIR/
cp manifest.json $RELEASE_DIR/manifest.json
cp package.json $RELEASE_DIR/package.json

# Create release notes
cat > $RELEASE_DIR/RELEASE_NOTES.md << EOF
# Release Notes - v1.0.0-beta

## Overview
Beta release of the Semantest Google Extension featuring TypeScript-EDA architecture.

## Features
- Google Search automation
- Google Images download capability
- Event-driven architecture
- Clean code principles
- Comprehensive test coverage

## Installation
1. Download \`chatgpt-extension-v1.0.0-beta.zip\`
2. Extract the contents
3. Load unpacked extension in Chrome
4. Test on google.com domains

## Testing Focus Areas
- Search functionality
- Image download features
- Event handling
- Error scenarios
- Performance metrics

## Known Issues
- This is a beta release for testing purposes
- Please report any issues found during testing

## Next Steps
- Gather feedback from beta testing
- Address any issues found
- Prepare for stable v1.0.0 release
EOF

echo "✓ Created release artifacts in $RELEASE_DIR"

# Step 11: Git commands summary
echo -e "\n[Step 11] Git commands to push changes:"
cat > git_beta_commands.txt << EOF
# Push the beta branch
git push origin $BETA_BRANCH

# Push the tag
git push origin v1.0.0-beta

# Create a pull request (if using GitHub)
# gh pr create --base main --head $BETA_BRANCH --title "Release: v1.0.0-beta" --body "Beta release for testing"

# After testing, merge to main
# git checkout main
# git merge $BETA_BRANCH
# git push origin main
EOF

echo "✓ Git commands saved to git_beta_commands.txt"

# Step 12: Summary
echo -e "\n========================================="
echo "Beta Release Preparation Complete!"
echo "========================================="
echo "Branch: $BETA_BRANCH"
echo "Tag: v1.0.0-beta"
echo "Package: chatgpt-extension-v1.0.0-beta.zip"
echo "Artifacts: $RELEASE_DIR/"
echo ""
echo "Next steps:"
echo "1. Review the changes"
echo "2. Push branch: git push origin $BETA_BRANCH"
echo "3. Push tag: git push origin v1.0.0-beta"
echo "4. Create GitHub release with chatgpt-extension-v1.0.0-beta.zip"
echo "5. Test the beta release"
echo ""
echo "To execute push commands:"
echo "  bash git_beta_push.sh"
echo "========================================="