#!/bin/bash

# Git push commands for beta release
# Execute after running beta_release_workflow.sh

set -e  # Exit on error

echo "========================================="
echo "Pushing Beta Release to Remote"
echo "========================================="

# Get current branch
CURRENT_BRANCH=$(git branch --show-current)
echo "Current branch: $CURRENT_BRANCH"

# Expected beta branch
BETA_BRANCH="release/v1.0.0-beta"

# Verify we're on the beta branch
if [ "$CURRENT_BRANCH" != "$BETA_BRANCH" ]; then
    echo "⚠️  Warning: Not on beta branch!"
    echo "   Current: $CURRENT_BRANCH"
    echo "   Expected: $BETA_BRANCH"
    read -p "Do you want to continue anyway? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "❌ Push cancelled"
        exit 1
    fi
fi

# Step 1: Push the beta branch
echo -e "\n[Step 1] Pushing branch $BETA_BRANCH..."
git push origin $BETA_BRANCH
echo "✓ Branch pushed successfully"

# Step 2: Push the tag
echo -e "\n[Step 2] Pushing tag v1.0.0-beta..."
git push origin v1.0.0-beta
echo "✓ Tag pushed successfully"

# Step 3: Create GitHub release commands
echo -e "\n[Step 3] GitHub release commands..."
cat > github_beta_release.sh << 'EOF'
#!/bin/bash

# Create GitHub release for v1.0.0-beta
echo "Creating GitHub release for v1.0.0-beta..."

# Using GitHub CLI (gh)
gh release create v1.0.0-beta \
  --title "Beta Release v1.0.0-beta" \
  --notes "## Beta Release - Semantest Google Extension

This is a beta release for testing the Semantest Google Extension.

### Features
- Google Search automation with TypeScript-EDA architecture
- Google Images download functionality
- Event-driven domain model
- Clean architecture implementation
- Comprehensive test coverage

### Installation
1. Download \`chatgpt-extension-v1.0.0-beta.zip\`
2. Extract the contents
3. Open Chrome and go to \`chrome://extensions/\`
4. Enable Developer mode
5. Click 'Load unpacked' and select the extracted folder

### Testing Focus
- Search functionality on google.com
- Image download features
- Event handling and error scenarios
- Performance and reliability

### Known Limitations
This is a beta release. Please report any issues found during testing.

### What's Next
After beta testing, we'll incorporate feedback and prepare for the stable v1.0.0 release." \
  --prerelease \
  chatgpt-extension-v1.0.0-beta.zip

echo "✓ GitHub release created!"
EOF

chmod +x github_beta_release.sh
echo "✓ Created github_beta_release.sh"

# Step 4: Summary
echo -e "\n========================================="
echo "Beta Release Push Complete!"
echo "========================================="
echo "✅ Branch pushed: $BETA_BRANCH"
echo "✅ Tag pushed: v1.0.0-beta"
echo ""
echo "Next steps:"
echo "1. Create GitHub release: bash github_beta_release.sh"
echo "2. Or manually create release at:"
echo "   https://github.com/semantest/workspace/releases/new"
echo "3. Upload chatgpt-extension-v1.0.0-beta.zip"
echo "4. Mark as pre-release"
echo "5. Share with beta testers"
echo ""
echo "To create pull request to main:"
echo "  gh pr create --base main --head $BETA_BRANCH \\"
echo "    --title 'Release: v1.0.0-beta' \\"
echo "    --body 'Beta release for testing'"
echo "========================================="