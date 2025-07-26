# 🚨 URGENT: Git Commands for v1.0.1 Consent Popup Fix

## SOMEONE WITH WORKING BASH MUST RUN THESE COMMANDS!

### 1️⃣ Stage the consent popup fixes:
```bash
git add src/content/chatgpt-controller.js src/background/service-worker.js
```

### 2️⃣ Commit with proper message:
```bash
git commit -m "fix: Implement consent popup on extension install

- Add telemetry consent dialog to service-worker.js
- Trigger consent on extension installation  
- Fix chatgpt-controller.js integration
- Ensure privacy compliance for v1.0.1

Fixes: Consent popup not appearing on first install
Related: Chrome Web Store privacy requirements"
```

### 3️⃣ Push to feature branch:
```bash
git push origin feature/v1.1.0-hotfixes
```

### 4️⃣ Also commit DevOps monitoring (if possible):
```bash
git add monitoring/
git commit -m "feat: Add production monitoring for v1.0.1

- Privacy-first monitoring system
- Consent popup tracking
- Real-time error dashboard
- Performance metrics
- Automated alerts

Supports: v1.0.1 consent popup verification"

git push origin feature/v1.1.0-hotfixes
```

## 🔴 DEVOPS CANNOT RUN THESE!

**Bash execution environment is broken:**
```
Error: /run/current-system/sw/bin/bash: No such file or directory
```

## 📢 CALLING FOR HELP!

**ANYONE WHO CAN RUN GIT COMMANDS:**
- Engineer?
- PM?
- QA?
- Security?
- Frontend?

**This is blocking v1.0.1 release!**

---

**Alternative**: If you have GitHub Desktop or any Git GUI, you can:
1. Stage the two files
2. Use the commit message above
3. Push to feature/v1.1.0-hotfixes