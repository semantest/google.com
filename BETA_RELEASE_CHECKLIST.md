# Beta Release Checklist - v1.0.0-beta

## Pre-Release Verification

- [ ] All tests passing
  ```bash
  npm test
  ```

- [ ] TypeScript compilation successful
  ```bash
  npm run build
  ```

- [ ] Linting passes
  ```bash
  npm run lint
  ```

- [ ] No uncommitted changes (optional)
  ```bash
  git status
  ```

## Release Workflow

### 1. Run Beta Release Workflow
- [ ] Execute the main release script
  ```bash
  bash beta_release_workflow.sh
  ```

This script will:
- Create release branch `release/v1.0.0-beta`
- Update manifest.json to version `1.0.0-beta`
- Commit the version change
- Create annotated tag `v1.0.0-beta`
- Generate the extension package `chatgpt-extension-v1.0.0-beta.zip`
- Create release artifacts in `releases/v1.0.0-beta/`

### 2. Push to Remote
- [ ] Push branch and tag
  ```bash
  bash git_beta_push.sh
  ```

### 3. Create GitHub Release
- [ ] Create release on GitHub
  ```bash
  bash github_beta_release.sh
  ```

Or manually:
1. Go to https://github.com/semantest/workspace/releases/new
2. Choose tag: `v1.0.0-beta`
3. Title: "Beta Release v1.0.0-beta"
4. Mark as pre-release
5. Upload `chatgpt-extension-v1.0.0-beta.zip`
6. Add release notes

### 4. Testing
- [ ] Download release package from GitHub
- [ ] Install in Chrome as unpacked extension
- [ ] Test core functionality:
  - [ ] Google Search automation
  - [ ] Google Images download
  - [ ] Event handling
  - [ ] Error scenarios

### 5. Post-Release
- [ ] Notify beta testers
- [ ] Create feedback collection issue
- [ ] Monitor for bug reports
- [ ] Plan stable release based on feedback

## Quick Commands Reference

```bash
# Complete beta release process
bash beta_release_workflow.sh
bash git_beta_push.sh
bash github_beta_release.sh

# Manual git commands if needed
git checkout -b release/v1.0.0-beta
git tag -a v1.0.0-beta -m "Beta Release v1.0.0-beta"
git push origin release/v1.0.0-beta
git push origin v1.0.0-beta

# Create package manually
python3 create_beta_package.py

# Create pull request
gh pr create --base main --head release/v1.0.0-beta \
  --title "Release: v1.0.0-beta" \
  --body "Beta release for testing"
```

## File Structure

After running the release workflow, you should have:

```
google.com/
├── beta_release_workflow.sh     # Main release script
├── git_beta_push.sh            # Git push commands
├── github_beta_release.sh      # GitHub release creation
├── create_beta_package.py      # Package creation script
├── chatgpt-extension-v1.0.0-beta.zip  # Release package
├── git_beta_commands.txt       # Git command reference
└── releases/
    └── v1.0.0-beta/
        ├── chatgpt-extension-v1.0.0-beta.zip
        ├── manifest.json
        ├── package.json
        └── RELEASE_NOTES.md
```

## Rollback Procedure

If you need to rollback:

```bash
# Delete local tag
git tag -d v1.0.0-beta

# Delete remote tag
git push --delete origin v1.0.0-beta

# Delete branch
git branch -D release/v1.0.0-beta
git push --delete origin release/v1.0.0-beta

# Revert manifest.json
git checkout main -- manifest.json
```

## Success Criteria

- ✅ Tag `v1.0.0-beta` exists in repository
- ✅ Branch `release/v1.0.0-beta` pushed to remote
- ✅ GitHub release created with package
- ✅ Extension installable in Chrome
- ✅ Core functionality working
- ✅ Beta testers notified