# 📊 Semantest Production Monitoring

## Overview

Comprehensive monitoring system for the Semantest Chrome Extension with privacy-first design.

## Components

### 1. Error Tracking Dashboard (`error-tracking-dashboard.js`)
- Captures JavaScript errors, promise rejections, and Chrome API errors
- Respects user consent before collecting any data
- Sanitizes error messages to remove PII
- Real-time error reporting to backend

### 2. User Metrics (`user-metrics.js`)
- Privacy-first metrics collection
- Only collects data with explicit user consent
- Tracks feature usage and session data
- No PII collection
- Consent can be revoked at any time

### 3. Performance Monitor (`performance-monitor.js`)
- Tracks extension load times
- Monitors API call performance
- Memory usage tracking
- Long task detection
- Network request monitoring

### 4. Automated Alerts (`automated-alerts.js`)
- Real-time alert rules for critical metrics
- Configurable thresholds and cooldowns
- Multi-channel notifications
- Alert severity levels: info, warning, high, critical

### 5. Dashboard Server (`dashboard-server.js`)
- Real-time monitoring dashboard
- WebSocket support for live updates
- PostgreSQL backend for metrics storage
- RESTful API for metrics queries

## Alert Rules

| Alert | Threshold | Severity | Cooldown |
|-------|-----------|----------|----------|
| High Error Rate | >5% | Critical | 5 min |
| Slow Performance | >3s load | Warning | 10 min |
| Memory Leak | >10MB/hr | Warning | 30 min |
| API Failures | >10% | Critical | 5 min |
| Consent Issues | >5 failures | High | 10 min |
| Extension Crash | Any | Critical | 1 min |
| User Surge | 2x average | Info | 30 min |
| Storage Quota | >80% | Warning | 1 hour |

## Privacy Features

1. **Consent Required**: No data collection without explicit user consent
2. **Data Sanitization**: All PII removed before transmission
3. **Local First**: Metrics stored locally when possible
4. **Opt-out Anytime**: Users can revoke consent and delete data
5. **Transparent**: Users can see what data is collected

## Setup

### Extension Integration

```javascript
// In background.js or service worker
importScripts(
  'monitoring/error-tracking-dashboard.js',
  'monitoring/user-metrics.js',
  'monitoring/performance-monitor.js',
  'monitoring/automated-alerts.js'
);
```

### Dashboard Server

```bash
# Install dependencies
npm install express socket.io pg cors

# Set environment variables
export DATABASE_URL=postgresql://localhost/semantest_monitoring
export PORT=3001

# Start server
node monitoring/dashboard-server.js
```

### Database Setup

```sql
-- Run these in PostgreSQL
CREATE DATABASE semantest_monitoring;
-- Tables are auto-created by dashboard-server.js
```

## API Endpoints

### Metrics Collection
- `POST /api/errors` - Report errors
- `POST /metrics` - Send metrics
- `POST /alerts` - Trigger alerts

### Dashboard API
- `GET /api/dashboard/summary` - Overall metrics
- `GET /api/dashboard/errors?timeRange=1h` - Error data
- `GET /api/dashboard/performance?timeRange=1h` - Performance metrics
- `GET /api/dashboard/users?timeRange=1h` - User metrics
- `GET /api/dashboard/alerts` - Active alerts

### WebSocket Events
- `connection` - Client connected
- `error` - New error reported
- `metric` - New metric received
- `alert` - Alert triggered
- `metrics-update` - Real-time metrics

## Monitoring URLs

- Dashboard: http://localhost:3001
- WebSocket: ws://localhost:3001
- Health Check: http://localhost:3001/health

## Performance Tracking

### Automatic Measurements
- Extension load time
- Chrome API call durations
- Memory usage over time
- Long JavaScript tasks
- Network request timing

### Manual Measurements
```javascript
// Sync operation
performanceMonitor.measureOperation('saveData', () => {
  // Your code here
});

// Async operation
await performanceMonitor.measureAsyncOperation('fetchData', async () => {
  // Your async code here
});
```

## Alert Configuration

Modify alert rules in `automated-alerts.js`:

```javascript
{
  id: 'custom_alert',
  name: 'Custom Alert',
  condition: (metrics) => metrics.customMetric > threshold,
  severity: 'warning',
  message: 'Custom threshold exceeded',
  cooldown: 600000 // 10 minutes
}
```

## Security Notes

1. All endpoints should use HTTPS in production
2. Add authentication to dashboard endpoints
3. Rate limit metric collection endpoints
4. Validate all incoming data
5. Regular security audits of collected metrics

## Scaling Considerations

1. Use Redis for real-time metrics caching
2. Implement metric aggregation for high volume
3. Use time-series database for long-term storage
4. Add load balancing for multiple dashboard servers
5. Implement data retention policies

## DevOps Contact

For monitoring issues or questions:
- Check dashboard first
- Review alert history
- Contact DevOps team for escalation

**Monitoring Status: ACTIVE ✅**