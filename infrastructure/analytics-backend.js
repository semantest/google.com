/**
 * Analytics Backend Infrastructure
 * Production-ready analytics service for ChatGPT Extension
 */

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { createClient } = require('redis');
const { Pool } = require('pg');
const WebSocket = require('ws');

class AnalyticsBackend {
  constructor() {
    this.app = express();
    this.server = null;
    this.wss = null;
    this.redis = null;
    this.db = null;
    this.port = process.env.PORT || 3000;
  }

  async initialize() {
    // Set up database connections
    await this.setupDatabase();
    await this.setupRedis();
    
    // Configure Express app
    this.setupMiddleware();
    this.setupRoutes();
    this.setupWebSocket();
    
    // Start server
    this.start();
  }

  async setupDatabase() {
    // PostgreSQL for persistent analytics data
    this.db = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
    });

    // Create analytics tables
    await this.createTables();
  }

  async setupRedis() {
    // Redis for real-time data and caching
    this.redis = createClient({
      url: process.env.REDIS_URL
    });
    
    await this.redis.connect();
    console.log('✅ Redis connected');
  }

  setupMiddleware() {
    // Security
    this.app.use(helmet());
    
    // CORS for extension origin
    this.app.use(cors({
      origin: [
        'chrome-extension://*',
        'https://analytics.semantest.com',
        'https://dashboard.semantest.com'
      ],
      credentials: true
    }));

    // Rate limiting
    const limiter = rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 1000, // limit each IP to 1000 requests per windowMs
      message: 'Too many requests from this IP'
    });
    this.app.use('/v1/', limiter);

    // Body parsing
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true }));

    // Request logging
    this.app.use((req, res, next) => {
      console.log(`${new Date().toISOString()} ${req.method} ${req.path}`);
      next();
    });
  }

  setupRoutes() {
    // Health check
    this.app.get('/health', (req, res) => {
      res.json({ 
        status: 'healthy', 
        timestamp: new Date().toISOString(),
        version: '1.0.0'
      });
    });

    // Analytics events endpoint
    this.app.post('/v1/events', async (req, res) => {
      try {
        const events = Array.isArray(req.body.events) ? req.body.events : [req.body];
        
        for (const event of events) {
          await this.processEvent(event);
        }
        
        res.json({ success: true, processed: events.length });
      } catch (error) {
        console.error('Error processing events:', error);
        res.status(500).json({ error: 'Failed to process events' });
      }
    });

    // Beta metrics endpoint
    this.app.post('/v1/beta/:metric', async (req, res) => {
      try {
        const { metric } = req.params;
        const data = req.body;
        
        await this.processBetaMetric(metric, data);
        
        // Send real-time update to dashboard
        this.broadcastToClients('beta_metric', { metric, data });
        
        res.json({ success: true });
      } catch (error) {
        console.error('Error processing beta metric:', error);
        res.status(500).json({ error: 'Failed to process metric' });
      }
    });

    // Dashboard data endpoint
    this.app.get('/v1/dashboard', async (req, res) => {
      try {
        const timeRange = req.query.range || '24h';
        const data = await this.getDashboardData(timeRange);
        
        res.json(data);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        res.status(500).json({ error: 'Failed to fetch dashboard data' });
      }
    });

    // User feedback endpoint
    this.app.post('/v1/feedback', async (req, res) => {
      try {
        const feedback = req.body;
        await this.processFeedback(feedback);
        
        res.json({ success: true });
      } catch (error) {
        console.error('Error processing feedback:', error);
        res.status(500).json({ error: 'Failed to process feedback' });
      }
    });

    // Error reports endpoint
    this.app.post('/v1/errors', async (req, res) => {
      try {
        const errorReport = req.body;
        await this.processError(errorReport);
        
        // Alert on critical errors
        if (errorReport.severity === 'critical') {
          await this.sendCriticalErrorAlert(errorReport);
        }
        
        res.json({ success: true });
      } catch (error) {
        console.error('Error processing error report:', error);
        res.status(500).json({ error: 'Failed to process error' });
      }
    });

    // Performance metrics endpoint
    this.app.post('/v1/performance', async (req, res) => {
      try {
        const metrics = req.body;
        await this.processPerformanceMetrics(metrics);
        
        res.json({ success: true });
      } catch (error) {
        console.error('Error processing performance metrics:', error);
        res.status(500).json({ error: 'Failed to process metrics' });
      }
    });
  }

  setupWebSocket() {
    this.wss = new WebSocket.Server({ port: 8080 });
    
    this.wss.on('connection', (ws) => {
      console.log('Dashboard client connected');
      
      ws.on('message', (message) => {
        try {
          const data = JSON.parse(message);
          this.handleWebSocketMessage(ws, data);
        } catch (error) {
          console.error('Invalid WebSocket message:', error);
        }
      });
      
      ws.on('close', () => {
        console.log('Dashboard client disconnected');
      });
    });
  }

  async createTables() {
    const queries = [
      `CREATE TABLE IF NOT EXISTS events (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        user_id VARCHAR(255),
        session_id VARCHAR(255),
        version VARCHAR(50),
        environment VARCHAR(50),
        properties JSONB,
        timestamp TIMESTAMP DEFAULT NOW()
      )`,
      
      `CREATE TABLE IF NOT EXISTS beta_metrics (
        id SERIAL PRIMARY KEY,
        metric_type VARCHAR(255) NOT NULL,
        user_id VARCHAR(255),
        version VARCHAR(50),
        data JSONB,
        timestamp TIMESTAMP DEFAULT NOW()
      )`,
      
      `CREATE TABLE IF NOT EXISTS feedback (
        id SERIAL PRIMARY KEY,
        type VARCHAR(50),
        rating INTEGER,
        message TEXT,
        email VARCHAR(255),
        user_id VARCHAR(255),
        version VARCHAR(50),
        metadata JSONB,
        timestamp TIMESTAMP DEFAULT NOW()
      )`,
      
      `CREATE TABLE IF NOT EXISTS errors (
        id SERIAL PRIMARY KEY,
        message TEXT,
        stack TEXT,
        severity VARCHAR(50),
        user_id VARCHAR(255),
        version VARCHAR(50),
        context JSONB,
        timestamp TIMESTAMP DEFAULT NOW()
      )`,
      
      `CREATE TABLE IF NOT EXISTS performance_metrics (
        id SERIAL PRIMARY KEY,
        metric_name VARCHAR(255),
        value FLOAT,
        unit VARCHAR(50),
        user_id VARCHAR(255),
        version VARCHAR(50),
        context JSONB,
        timestamp TIMESTAMP DEFAULT NOW()
      )`
    ];

    for (const query of queries) {
      await this.db.query(query);
    }

    // Create indexes
    await this.db.query('CREATE INDEX IF NOT EXISTS idx_events_timestamp ON events(timestamp)');
    await this.db.query('CREATE INDEX IF NOT EXISTS idx_events_name ON events(name)');
    await this.db.query('CREATE INDEX IF NOT EXISTS idx_beta_metrics_type ON beta_metrics(metric_type)');
    await this.db.query('CREATE INDEX IF NOT EXISTS idx_errors_severity ON errors(severity)');
  }

  async processEvent(event) {
    // Store in database
    await this.db.query(
      'INSERT INTO events (name, user_id, session_id, version, environment, properties) VALUES ($1, $2, $3, $4, $5, $6)',
      [event.name, event.userId, event.sessionId, event.version, event.environment, event.properties]
    );

    // Update real-time counters in Redis
    const key = `events:${event.name}:${new Date().toDateString()}`;
    await this.redis.incr(key);
    await this.redis.expire(key, 86400 * 7); // 7 days TTL

    // Broadcast to connected dashboards
    this.broadcastToClients('event', event);
  }

  async processBetaMetric(metric, data) {
    // Store in database
    await this.db.query(
      'INSERT INTO beta_metrics (metric_type, user_id, version, data) VALUES ($1, $2, $3, $4)',
      [metric, data.userId, data.version, data]
    );

    // Update Redis counters
    const todayKey = `beta:${metric}:${new Date().toDateString()}`;
    await this.redis.incr(todayKey);
    await this.redis.expire(todayKey, 86400 * 30); // 30 days TTL
  }

  async processFeedback(feedback) {
    // Store in database
    await this.db.query(
      'INSERT INTO feedback (type, rating, message, email, user_id, version, metadata) VALUES ($1, $2, $3, $4, $5, $6, $7)',
      [feedback.type, feedback.rating, feedback.message, feedback.email, feedback.userId, feedback.version, feedback.metadata]
    );

    // Send notification for low ratings
    if (feedback.rating <= 2) {
      await this.sendLowRatingAlert(feedback);
    }
  }

  async processError(errorReport) {
    // Store in database
    await this.db.query(
      'INSERT INTO errors (message, stack, severity, user_id, version, context) VALUES ($1, $2, $3, $4, $5, $6)',
      [errorReport.message, errorReport.stack, errorReport.severity, errorReport.userId, errorReport.version, errorReport.context]
    );

    // Update error rate in Redis
    const errorKey = `errors:${new Date().toDateString()}`;
    await this.redis.incr(errorKey);
    await this.redis.expire(errorKey, 86400 * 7);
  }

  async processPerformanceMetrics(metrics) {
    for (const metric of metrics) {
      await this.db.query(
        'INSERT INTO performance_metrics (metric_name, value, unit, user_id, version, context) VALUES ($1, $2, $3, $4, $5, $6)',
        [metric.name, metric.value, metric.unit, metric.userId, metric.version, metric.context]
      );
    }
  }

  async getDashboardData(timeRange) {
    const timeFilter = this.getTimeFilter(timeRange);
    
    const [
      activeUsers,
      totalEvents,
      errorRate,
      avgRating,
      topFeatures
    ] = await Promise.all([
      this.getActiveUsers(timeFilter),
      this.getTotalEvents(timeFilter),
      this.getErrorRate(timeFilter),
      this.getAverageRating(timeFilter),
      this.getTopFeatures(timeFilter)
    ]);

    return {
      activeUsers,
      totalEvents,
      errorRate,
      avgRating,
      topFeatures,
      timestamp: new Date().toISOString()
    };
  }

  getTimeFilter(range) {
    const now = new Date();
    const filters = {
      '1h': new Date(now - 60 * 60 * 1000),
      '24h': new Date(now - 24 * 60 * 60 * 1000),
      '7d': new Date(now - 7 * 24 * 60 * 60 * 1000),
      '30d': new Date(now - 30 * 24 * 60 * 60 * 1000)
    };
    return filters[range] || filters['24h'];
  }

  async getActiveUsers(since) {
    const result = await this.db.query(
      'SELECT COUNT(DISTINCT user_id) as count FROM events WHERE timestamp > $1',
      [since]
    );
    return result.rows[0].count;
  }

  async getTotalEvents(since) {
    const result = await this.db.query(
      'SELECT COUNT(*) as count FROM events WHERE timestamp > $1',
      [since]
    );
    return result.rows[0].count;
  }

  async getErrorRate(since) {
    const [errors, total] = await Promise.all([
      this.db.query('SELECT COUNT(*) as count FROM errors WHERE timestamp > $1', [since]),
      this.db.query('SELECT COUNT(*) as count FROM events WHERE timestamp > $1', [since])
    ]);
    
    const errorCount = errors.rows[0].count;
    const totalCount = total.rows[0].count;
    
    return totalCount > 0 ? (errorCount / totalCount) * 100 : 0;
  }

  async getAverageRating(since) {
    const result = await this.db.query(
      'SELECT AVG(rating) as avg FROM feedback WHERE timestamp > $1 AND rating IS NOT NULL',
      [since]
    );
    return parseFloat(result.rows[0].avg) || 0;
  }

  async getTopFeatures(since) {
    const result = await this.db.query(
      `SELECT properties->>'feature' as feature, COUNT(*) as count 
       FROM events 
       WHERE timestamp > $1 AND name = 'feature_used' 
       GROUP BY properties->>'feature' 
       ORDER BY count DESC 
       LIMIT 10`,
      [since]
    );
    return result.rows;
  }

  broadcastToClients(type, data) {
    const message = JSON.stringify({ type, data, timestamp: Date.now() });
    
    this.wss.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  }

  async sendCriticalErrorAlert(error) {
    // Send to Slack/Discord/Email
    console.log('🚨 CRITICAL ERROR ALERT:', error);
    // TODO: Implement actual alerting
  }

  async sendLowRatingAlert(feedback) {
    console.log('⚠️ LOW RATING ALERT:', feedback);
    // TODO: Implement actual alerting
  }

  start() {
    this.server = this.app.listen(this.port, () => {
      console.log(`✅ Analytics backend running on port ${this.port}`);
      console.log(`✅ WebSocket server running on port 8080`);
    });
  }

  async stop() {
    if (this.server) {
      this.server.close();
    }
    if (this.wss) {
      this.wss.close();
    }
    if (this.redis) {
      await this.redis.quit();
    }
    if (this.db) {
      await this.db.end();
    }
  }
}

// Start the backend if run directly
if (require.main === module) {
  const backend = new AnalyticsBackend();
  backend.initialize().catch(console.error);

  // Graceful shutdown
  process.on('SIGTERM', () => backend.stop());
  process.on('SIGINT', () => backend.stop());
}

module.exports = AnalyticsBackend;