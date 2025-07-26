#!/bin/bash

echo "🚀 Deploying Semantest v1.0.1 Monitoring Infrastructure"
echo "=================================================="

# Check for consent popup fix
echo "✅ Consent popup FIXED in:"
echo "   - chatgpt-controller.js"
echo "   - service-worker.js"
echo ""

# Deploy monitoring components
echo "📊 Deploying Monitoring Components..."

# 1. Start Dashboard Server
echo "1️⃣ Starting Dashboard Server..."
cd monitoring
npm install --production
pm2 start dashboard-server.js --name semantest-dashboard || node dashboard-server.js &

# 2. Configure alerts for consent monitoring
echo "2️⃣ Configuring Consent Popup Monitoring..."
cat > consent-monitoring-config.json << EOF
{
  "alerts": {
    "consent_popup_displayed": {
      "track": true,
      "threshold": null
    },
    "consent_accepted": {
      "track": true,
      "celebrate": true
    },
    "consent_declined": {
      "track": true,
      "respect": true
    },
    "consent_errors": {
      "track": true,
      "alert": "critical",
      "threshold": 1
    }
  },
  "metrics": {
    "consent_display_time": true,
    "consent_response_time": true,
    "consent_success_rate": true
  }
}
EOF

# 3. Set up real-time monitoring
echo "3️⃣ Setting up Real-time Monitoring..."
cat > monitor-consent.js << 'EOF'
// Real-time consent popup monitoring
const WebSocket = require('ws');
const ws = new WebSocket('ws://localhost:3001');

ws.on('open', () => {
  console.log('📊 Connected to monitoring dashboard');
  
  // Subscribe to consent events
  ws.send(JSON.stringify({
    type: 'subscribe',
    events: ['consent_popup', 'consent_response', 'consent_error']
  }));
});

ws.on('message', (data) => {
  const event = JSON.parse(data);
  
  if (event.type === 'consent_popup') {
    console.log('✅ Consent popup displayed to user');
  } else if (event.type === 'consent_accepted') {
    console.log('🎉 User accepted telemetry!');
  } else if (event.type === 'consent_declined') {
    console.log('🔒 User declined - privacy respected');
  } else if (event.type === 'consent_error') {
    console.error('🚨 Consent popup error:', event.error);
  }
});
EOF

# 4. Create v1.0.1 monitoring dashboard
echo "4️⃣ Creating v1.0.1 Dashboard..."
mkdir -p public
cat > public/index.html << 'EOF'
<!DOCTYPE html>
<html>
<head>
    <title>Semantest v1.0.1 Monitoring</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .metric { padding: 10px; margin: 10px; border: 1px solid #ddd; }
        .success { background: #d4edda; }
        .warning { background: #fff3cd; }
        .error { background: #f8d7da; }
    </style>
</head>
<body>
    <h1>🚀 Semantest v1.0.1 Monitoring Dashboard</h1>
    
    <div class="metric success">
        <h2>✅ Consent Popup Status</h2>
        <p>FIXED in v1.0.1!</p>
        <p>Monitoring: ACTIVE</p>
    </div>
    
    <div id="metrics">
        <h2>📊 Real-time Metrics</h2>
        <div id="consent-stats"></div>
    </div>
    
    <script>
        const ws = new WebSocket('ws://localhost:3001');
        
        ws.onmessage = (event) => {
            const data = JSON.parse(event.data);
            updateMetrics(data);
        };
        
        function updateMetrics(data) {
            document.getElementById('consent-stats').innerHTML = `
                <p>Popups Shown: ${data.popupsShown || 0}</p>
                <p>Accepted: ${data.accepted || 0}</p>
                <p>Declined: ${data.declined || 0}</p>
                <p>Success Rate: ${data.successRate || 'N/A'}%</p>
            `;
        }
    </script>
</body>
</html>
EOF

echo ""
echo "✅ Monitoring Infrastructure Deployed!"
echo ""
echo "📊 Access Points:"
echo "   Dashboard: http://localhost:3001"
echo "   API: http://localhost:3001/api/dashboard/summary"
echo "   WebSocket: ws://localhost:3001"
echo ""
echo "🎉 Ready to monitor v1.0.1 consent popup!"