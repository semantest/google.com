# URGENT: Error Tracking Setup for ChatGPT Extension Beta

## 🚨 IMMEDIATE SETUP REQUIRED

### 1. FREE SENTRY ACCOUNT SETUP (5 minutes)

**Step 1: Create Account**
- Go to: https://sentry.io/signup/
- Sign up with GitHub account
- Select "React" as platform (closest to Chrome extension)
- Copy DSN: `https://[key]@[org].ingest.sentry.io/[project]`

**Step 2: Configure Project**
```javascript
// Project settings:
Name: chatgpt-extension-beta
Platform: JavaScript
Environment: production
Release: 1.0.0-beta
```

### 2. ERROR COLLECTION ENDPOINT (Ready to Deploy)

**File**: `/infrastructure/simple-error-server.js`
```javascript
const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

// Simple error collection
app.post('/errors', (req, res) => {
    console.error('ERROR CAPTURED:', JSON.stringify(req.body, null, 2));
    // Store in file for now
    const fs = require('fs');
    fs.appendFileSync('errors.log', JSON.stringify(req.body) + '\n');
    res.json({ success: true });
});

app.listen(3001, () => {
    console.log('🚨 Error tracking live at http://localhost:3001/errors');
});
```

**Deploy NOW**:
```bash
cd /home/chous/work/semantest/google.com/infrastructure
node simple-error-server.js &
```

### 3. EXTENSION INTEGRATION CODE (Copy to Extension)

**File**: `/extension.chrome/src/error-tracker.js`
```javascript
class QuickErrorTracker {
    constructor() {
        this.endpoint = 'http://localhost:3001/errors';
        this.userId = this.getUserId();
        this.setupGlobalHandler();
    }

    setupGlobalHandler() {
        window.addEventListener('error', (e) => this.captureError(e.error));
        window.addEventListener('unhandledrejection', (e) => this.captureError(e.reason));
    }

    captureError(error) {
        const errorData = {
            message: error.message || String(error),
            stack: error.stack,
            timestamp: new Date().toISOString(),
            userId: this.userId,
            version: '1.0.0-beta',
            url: window.location?.href,
            userAgent: navigator.userAgent
        };

        fetch(this.endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(errorData)
        }).catch(console.warn);
    }

    getUserId() {
        let id = localStorage.getItem('userId');
        if (!id) {
            id = 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
            localStorage.setItem('userId', id);
        }
        return id;
    }
}

// Auto-initialize
new QuickErrorTracker();
```

### 4. BASIC DASHBOARD (View Errors)

**File**: `/infrastructure/error-dashboard.html`
```html
<!DOCTYPE html>
<html>
<head>
    <title>Error Dashboard</title>
    <style>
        body { font-family: monospace; padding: 20px; }
        .error { border: 1px solid #f00; margin: 10px 0; padding: 10px; }
        .timestamp { color: #666; font-size: 12px; }
    </style>
</head>
<body>
    <h1>🚨 ChatGPT Extension Error Dashboard</h1>
    <div id="errors">Loading...</div>
    
    <script>
        function loadErrors() {
            fetch('/errors.log')
                .then(r => r.text())
                .then(data => {
                    const errors = data.split('\n').filter(Boolean).map(JSON.parse);
                    document.getElementById('errors').innerHTML = errors.map(e => `
                        <div class="error">
                            <div class="timestamp">${e.timestamp} - User: ${e.userId}</div>
                            <strong>${e.message}</strong>
                            <pre>${e.stack}</pre>
                        </div>
                    `).join('');
                })
                .catch(e => document.getElementById('errors').innerHTML = 'No errors yet');
        }
        
        setInterval(loadErrors, 5000);
        loadErrors();
    </script>
</body>
</html>
```

## 🚀 QUICKEST DEPLOYMENT (30 seconds)

### Option A: Local Server
```bash
# Terminal 1 - Start error server
cd /home/chous/work/semantest/google.com/infrastructure
echo 'const express=require("express");const cors=require("cors");const fs=require("fs");const app=express();app.use(cors());app.use(express.json());app.post("/errors",(req,res)=>{console.error("ERROR:",JSON.stringify(req.body,null,2));fs.appendFileSync("errors.log",JSON.stringify(req.body)+"\n");res.json({success:true})});app.listen(3001,()=>console.log("🚨 Error tracking live at http://localhost:3001/errors"));' > quick-error-server.js
node quick-error-server.js
```

### Option B: Free Hosting (Recommended)
```bash
# Deploy to Vercel/Netlify (free)
npx vercel --prod
# Copy URL and update endpoint in extension
```

## 📋 PRE-LAUNCH CHECKLIST

- [ ] Sentry account created OR local server running
- [ ] Error endpoint responding: http://localhost:3001/errors
- [ ] Extension integration code added
- [ ] Test error capture working
- [ ] Dashboard accessible
- [ ] GitHub release confirmed

## ⚡ EMERGENCY CONTACTS

**If errors start flooding in:**
1. Check error dashboard
2. Look for patterns (same error, same user)
3. Create hotfix branch immediately
4. Use automated hotfix pipeline

## 🔗 GITHUB RELEASE STATUS

**MANUAL VERIFICATION REQUIRED:**
```bash
curl -s https://api.github.com/repos/semantest/workspace/releases/tags/v1.0.0-beta | jq '.assets[].name'
```

**Expected**: Should show `chatgpt-extension-v1.0.0-beta.zip`

---

**STATUS**: ⚠️ DEPLOY IMMEDIATELY BEFORE BETA LAUNCH!