const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
    origin: ['chrome-extension://*', 'https://chat.openai.com', 'https://chatgpt.com'],
    credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.static(__dirname));

// Ensure errors.log exists
const errorLogPath = path.join(__dirname, 'errors.log');
if (!fs.existsSync(errorLogPath)) {
    fs.writeFileSync(errorLogPath, '');
}

// Error collection endpoint
app.post('/errors', (req, res) => {
    const error = {
        ...req.body,
        serverTimestamp: new Date().toISOString(),
        ip: req.ip
    };
    
    console.error('🚨 ERROR CAPTURED:', JSON.stringify(error, null, 2));
    
    // Append to log file
    fs.appendFileSync(errorLogPath, JSON.stringify(error) + '\n');
    
    // Send to console for immediate visibility
    console.log(`
    🚨 EXTENSION ERROR:
    User: ${error.userId}
    Message: ${error.message}
    Version: ${error.version}
    Time: ${error.timestamp}
    `);
    
    res.json({ 
        success: true, 
        message: 'Error logged successfully',
        errorId: Date.now()
    });
});

// Get errors for dashboard
app.get('/api/errors', (req, res) => {
    try {
        const data = fs.readFileSync(errorLogPath, 'utf8');
        const errors = data.split('\n')
            .filter(line => line.trim())
            .map(line => JSON.parse(line))
            .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
            .slice(0, 100); // Last 100 errors
        
        res.json(errors);
    } catch (err) {
        res.json([]);
    }
});

// Health check
app.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        version: '1.0.0-beta'
    });
});

// Basic dashboard
app.get('/', (req, res) => {
    res.send(`
    <!DOCTYPE html>
    <html>
    <head>
        <title>ChatGPT Extension Error Dashboard</title>
        <style>
            body { 
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                margin: 0; 
                padding: 20px; 
                background: #f5f5f5;
            }
            .header {
                background: #fff;
                padding: 20px;
                border-radius: 8px;
                box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                margin-bottom: 20px;
            }
            .error { 
                background: #fff;
                border-left: 4px solid #e74c3c;
                margin: 10px 0; 
                padding: 15px;
                border-radius: 4px;
                box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            }
            .timestamp { 
                color: #7f8c8d; 
                font-size: 12px; 
                margin-bottom: 8px;
            }
            .message {
                font-weight: 600;
                color: #2c3e50;
                margin-bottom: 10px;
            }
            .details {
                font-size: 14px;
                color: #34495e;
                margin-bottom: 10px;
            }
            .stack {
                background: #2c3e50;
                color: #ecf0f1;
                padding: 10px;
                border-radius: 4px;
                font-family: 'Courier New', monospace;
                font-size: 12px;
                overflow-x: auto;
                white-space: pre-wrap;
            }
            .stats {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                gap: 15px;
                margin-bottom: 20px;
            }
            .stat {
                background: #fff;
                padding: 20px;
                border-radius: 8px;
                box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                text-align: center;
            }
            .stat-value {
                font-size: 32px;
                font-weight: 600;
                color: #e74c3c;
            }
            .stat-label {
                color: #7f8c8d;
                margin-top: 5px;
            }
            .loading {
                text-align: center;
                padding: 40px;
                color: #7f8c8d;
            }
        </style>
    </head>
    <body>
        <div class="header">
            <h1>🚨 ChatGPT Extension Error Dashboard</h1>
            <p>Real-time error monitoring for beta release v1.0.0-beta</p>
        </div>
        
        <div class="stats">
            <div class="stat">
                <div class="stat-value" id="totalErrors">0</div>
                <div class="stat-label">Total Errors</div>
            </div>
            <div class="stat">
                <div class="stat-value" id="uniqueUsers">0</div>
                <div class="stat-label">Affected Users</div>
            </div>
            <div class="stat">
                <div class="stat-value" id="lastError">-</div>
                <div class="stat-label">Last Error</div>
            </div>
        </div>
        
        <div id="errors" class="loading">Loading errors...</div>
        
        <script>
            function formatTime(timestamp) {
                return new Date(timestamp).toLocaleString();
            }
            
            function loadErrors() {
                fetch('/api/errors')
                    .then(r => r.json())
                    .then(errors => {
                        // Update stats
                        document.getElementById('totalErrors').textContent = errors.length;
                        document.getElementById('uniqueUsers').textContent = 
                            new Set(errors.map(e => e.userId)).size;
                        document.getElementById('lastError').textContent = 
                            errors.length > 0 ? formatTime(errors[0].timestamp) : 'None';
                        
                        // Display errors
                        if (errors.length === 0) {
                            document.getElementById('errors').innerHTML = 
                                '<div class="loading">✅ No errors reported yet!</div>';
                            return;
                        }
                        
                        document.getElementById('errors').innerHTML = errors.map(e => \`
                            <div class="error">
                                <div class="timestamp">\${formatTime(e.timestamp)} - User: \${e.userId}</div>
                                <div class="message">\${e.message || 'Unknown error'}</div>
                                <div class="details">
                                    Version: \${e.version} | 
                                    URL: \${e.url || 'Unknown'} |
                                    Browser: \${e.userAgent ? e.userAgent.split(' ').pop() : 'Unknown'}
                                </div>
                                \${e.stack ? \`<div class="stack">\${e.stack}</div>\` : ''}
                            </div>
                        \`).join('');
                    })
                    .catch(e => {
                        document.getElementById('errors').innerHTML = 
                            '<div class="loading">❌ Failed to load errors</div>';
                    });
            }
            
            // Auto-refresh every 5 seconds
            setInterval(loadErrors, 5000);
            loadErrors();
        </script>
    </body>
    </html>
    `);
});

// Start server
app.listen(PORT, () => {
    console.log(`
🚨 CRITICAL ERROR TRACKING LIVE!

✅ Error Collection: http://localhost:${PORT}/errors
✅ Dashboard: http://localhost:${PORT}
✅ Health Check: http://localhost:${PORT}/health
✅ API: http://localhost:${PORT}/api/errors

Ready for ChatGPT Extension Beta Launch!
    `);
});

module.exports = app;