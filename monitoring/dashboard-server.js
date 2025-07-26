/**
 * Monitoring Dashboard Server
 * Real-time monitoring dashboard for production
 */

const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const { Pool } = require('pg');

class MonitoringDashboardServer {
  constructor() {
    this.app = express();
    this.server = http.createServer(this.app);
    this.io = socketIo(this.server, {
      cors: {
        origin: "*",
        methods: ["GET", "POST"]
      }
    });
    
    // PostgreSQL connection for metrics storage
    this.db = new Pool({
      connectionString: process.env.DATABASE_URL || 'postgresql://localhost/semantest_monitoring'
    });
    
    this.metrics = {
      errors: [],
      performance: [],
      users: {},
      alerts: []
    };
    
    this.setupMiddleware();
    this.setupRoutes();
    this.setupWebSocket();
    this.setupDatabase();
  }

  setupMiddleware() {
    this.app.use(cors());
    this.app.use(express.json());
    this.app.use(express.static('public'));
  }

  setupRoutes() {
    // Error tracking endpoint
    this.app.post('/api/errors', async (req, res) => {
      const { error, metadata } = req.body;
      
      try {
        // Store in database
        await this.storeError(error, metadata);
        
        // Update real-time metrics
        this.metrics.errors.push({ ...error, receivedAt: Date.now() });
        
        // Broadcast to dashboard
        this.io.emit('error', error);
        
        res.json({ success: true });
      } catch (e) {
        console.error('Error storing:', e);
        res.status(500).json({ error: 'Storage failed' });
      }
    });

    // Metrics endpoint
    this.app.post('/metrics', async (req, res) => {
      const { metric, metadata } = req.body;
      
      try {
        await this.storeMetric(metric, metadata);
        
        // Broadcast to dashboard
        this.io.emit('metric', metric);
        
        res.json({ success: true });
      } catch (e) {
        console.error('Metric storage failed:', e);
        res.status(500).json({ error: 'Storage failed' });
      }
    });

    // Alerts endpoint
    this.app.post('/alerts', async (req, res) => {
      const alert = req.body;
      
      try {
        await this.handleAlert(alert);
        res.json({ success: true });
      } catch (e) {
        console.error('Alert handling failed:', e);
        res.status(500).json({ error: 'Alert failed' });
      }
    });

    // Dashboard API endpoints
    this.app.get('/api/dashboard/summary', async (req, res) => {
      const summary = await this.getDashboardSummary();
      res.json(summary);
    });

    this.app.get('/api/dashboard/errors', async (req, res) => {
      const { timeRange = '1h' } = req.query;
      const errors = await this.getErrors(timeRange);
      res.json(errors);
    });

    this.app.get('/api/dashboard/performance', async (req, res) => {
      const { timeRange = '1h' } = req.query;
      const performance = await this.getPerformanceMetrics(timeRange);
      res.json(performance);
    });

    this.app.get('/api/dashboard/users', async (req, res) => {
      const { timeRange = '1h' } = req.query;
      const users = await this.getUserMetrics(timeRange);
      res.json(users);
    });

    this.app.get('/api/dashboard/alerts', async (req, res) => {
      const alerts = await this.getActiveAlerts();
      res.json(alerts);
    });

    // Health check
    this.app.get('/health', (req, res) => {
      res.json({ 
        status: 'healthy',
        uptime: process.uptime(),
        memory: process.memoryUsage()
      });
    });
  }

  setupWebSocket() {
    this.io.on('connection', (socket) => {
      console.log('Dashboard client connected');
      
      // Send initial data
      socket.emit('initial-data', {
        errors: this.metrics.errors.slice(-100),
        alerts: this.metrics.alerts.filter(a => !a.resolved)
      });
      
      // Handle client requests
      socket.on('get-metrics', async (timeRange) => {
        const metrics = await this.getRealtimeMetrics(timeRange);
        socket.emit('metrics-update', metrics);
      });
      
      socket.on('acknowledge-alert', async (alertId) => {
        await this.acknowledgeAlert(alertId);
        this.io.emit('alert-acknowledged', alertId);
      });
      
      socket.on('disconnect', () => {
        console.log('Dashboard client disconnected');
      });
    });
  }

  async setupDatabase() {
    // Create tables if not exist
    const tables = [
      `CREATE TABLE IF NOT EXISTS errors (
        id SERIAL PRIMARY KEY,
        session_id VARCHAR(255),
        type VARCHAR(50),
        message TEXT,
        stack TEXT,
        version VARCHAR(20),
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`,
      
      `CREATE TABLE IF NOT EXISTS metrics (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100),
        value NUMERIC,
        metadata JSONB,
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`,
      
      `CREATE TABLE IF NOT EXISTS alerts (
        id SERIAL PRIMARY KEY,
        alert_id VARCHAR(255) UNIQUE,
        rule_id VARCHAR(100),
        severity VARCHAR(20),
        message TEXT,
        metrics JSONB,
        acknowledged BOOLEAN DEFAULT FALSE,
        resolved BOOLEAN DEFAULT FALSE,
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`,
      
      `CREATE TABLE IF NOT EXISTS user_sessions (
        id SERIAL PRIMARY KEY,
        session_id VARCHAR(255) UNIQUE,
        version VARCHAR(20),
        consent_given BOOLEAN,
        started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        last_seen TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`
    ];
    
    for (const query of tables) {
      try {
        await this.db.query(query);
      } catch (e) {
        console.error('Table creation failed:', e);
      }
    }
  }

  async storeError(error, metadata) {
    await this.db.query(
      `INSERT INTO errors (session_id, type, message, stack, version)
       VALUES ($1, $2, $3, $4, $5)`,
      [error.sessionId, error.type, error.message, error.stack, error.version]
    );
  }

  async storeMetric(metric, metadata) {
    await this.db.query(
      `INSERT INTO metrics (name, value, metadata)
       VALUES ($1, $2, $3)`,
      [metric.name, metric.value || 1, JSON.stringify(metadata)]
    );
  }

  async handleAlert(alert) {
    // Store alert
    await this.db.query(
      `INSERT INTO alerts (alert_id, rule_id, severity, message, metrics)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (alert_id) DO NOTHING`,
      [alert.id, alert.ruleId, alert.severity, alert.message, JSON.stringify(alert.metrics)]
    );
    
    // Add to real-time metrics
    this.metrics.alerts.push(alert);
    
    // Broadcast to dashboard
    this.io.emit('alert', alert);
    
    // Send notifications based on severity
    if (alert.severity === 'critical') {
      this.sendCriticalNotification(alert);
    }
  }

  async sendCriticalNotification(alert) {
    // Implement notification logic (email, Slack, etc.)
    console.error(`CRITICAL ALERT: ${alert.message}`);
  }

  async getDashboardSummary() {
    const [errors, metrics, alerts, users] = await Promise.all([
      this.db.query('SELECT COUNT(*) FROM errors WHERE timestamp > NOW() - INTERVAL \'24 hours\''),
      this.db.query('SELECT COUNT(*) FROM metrics WHERE timestamp > NOW() - INTERVAL \'24 hours\''),
      this.db.query('SELECT COUNT(*) FROM alerts WHERE resolved = FALSE'),
      this.db.query('SELECT COUNT(DISTINCT session_id) FROM user_sessions WHERE last_seen > NOW() - INTERVAL \'1 hour\'')
    ]);
    
    return {
      errors24h: parseInt(errors.rows[0].count),
      metrics24h: parseInt(metrics.rows[0].count),
      activeAlerts: parseInt(alerts.rows[0].count),
      activeUsers: parseInt(users.rows[0].count),
      timestamp: new Date().toISOString()
    };
  }

  async getErrors(timeRange) {
    const interval = this.parseTimeRange(timeRange);
    const result = await this.db.query(
      `SELECT type, COUNT(*) as count, MAX(timestamp) as last_seen
       FROM errors
       WHERE timestamp > NOW() - INTERVAL $1
       GROUP BY type
       ORDER BY count DESC`,
      [interval]
    );
    
    return result.rows;
  }

  async getPerformanceMetrics(timeRange) {
    const interval = this.parseTimeRange(timeRange);
    const result = await this.db.query(
      `SELECT 
         AVG(CAST(metadata->>'duration' AS NUMERIC)) as avg_duration,
         MAX(CAST(metadata->>'duration' AS NUMERIC)) as max_duration,
         COUNT(*) as count
       FROM metrics
       WHERE name LIKE '%performance%'
       AND timestamp > NOW() - INTERVAL $1`,
      [interval]
    );
    
    return result.rows[0];
  }

  async getUserMetrics(timeRange) {
    const interval = this.parseTimeRange(timeRange);
    const result = await this.db.query(
      `SELECT 
         COUNT(DISTINCT session_id) as unique_users,
         COUNT(*) as total_sessions,
         AVG(EXTRACT(EPOCH FROM (last_seen - started_at))) as avg_session_duration
       FROM user_sessions
       WHERE started_at > NOW() - INTERVAL $1`,
      [interval]
    );
    
    return result.rows[0];
  }

  async getActiveAlerts() {
    const result = await this.db.query(
      `SELECT * FROM alerts
       WHERE resolved = FALSE
       ORDER BY timestamp DESC
       LIMIT 50`
    );
    
    return result.rows;
  }

  async acknowledgeAlert(alertId) {
    await this.db.query(
      `UPDATE alerts SET acknowledged = TRUE WHERE alert_id = $1`,
      [alertId]
    );
  }

  async getRealtimeMetrics(timeRange = '1h') {
    const [errors, performance, users] = await Promise.all([
      this.getErrors(timeRange),
      this.getPerformanceMetrics(timeRange),
      this.getUserMetrics(timeRange)
    ]);
    
    return {
      errors,
      performance,
      users,
      timestamp: Date.now()
    };
  }

  parseTimeRange(timeRange) {
    const ranges = {
      '5m': '5 minutes',
      '15m': '15 minutes',
      '1h': '1 hour',
      '6h': '6 hours',
      '24h': '24 hours',
      '7d': '7 days',
      '30d': '30 days'
    };
    
    return ranges[timeRange] || '1 hour';
  }

  start(port = 3001) {
    this.server.listen(port, () => {
      console.log(`Monitoring dashboard server running on port ${port}`);
      console.log(`Dashboard: http://localhost:${port}`);
      console.log(`WebSocket: ws://localhost:${port}`);
    });
  }
}

// Start the server
const dashboard = new MonitoringDashboardServer();
dashboard.start(process.env.PORT || 3001);

module.exports = MonitoringDashboardServer;