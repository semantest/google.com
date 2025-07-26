# 📊 Semantest Production Monitoring Setup Guide

## Overview

This guide helps you set up and configure the production monitoring system for Semantest ChatGPT Extension v1.0.2+.

## 🚀 Quick Start

### 1. Prerequisites
- Node.js 16+ 
- PostgreSQL 12+
- Redis (optional, for caching)
- Chrome Extension v1.0.1+ deployed

### 2. Install Monitoring Server

```bash
# Clone monitoring infrastructure
cd monitoring/

# Install dependencies
npm install

# Set up database
createdb semantest_monitoring

# Configure environment
cp .env.example .env
# Edit .env with your settings

# Start server
npm start
```

### 3. Access Dashboard

- **URL**: http://localhost:3001
- **WebSocket**: ws://localhost:3001
- **API**: http://localhost:3001/api/dashboard/summary

## 📈 Key Metrics Tracked

### Consent System (v1.0.1+)
- `telemetryConsentPending` flag status
- Retry attempts and timing
- 30-second interval accuracy
- Success/decline rates

### Performance Metrics
- Extension load time (target: <3s)
- API response times
- Memory usage patterns
- Chrome API call efficiency

### Error Tracking
- JavaScript errors (with stack traces)
- Chrome API failures
- Network timeouts
- Consent popup failures

### User Metrics (Privacy-First)
- Anonymous session counts
- Feature usage (with consent)
- No PII collected
- Opt-out respected

## 🚨 Alert Configuration

### Critical Alerts (Immediate)
```yaml
high_error_rate:
  threshold: ">5%"
  action: "page_oncall"
  
consent_system_failure:
  threshold: ">10 failures"
  action: "create_incident"
```

### Warning Alerts (Review)
```yaml
slow_performance:
  threshold: ">3s load time"
  action: "notify_slack"
  
memory_leak:
  threshold: ">10MB/hour growth"
  action: "investigate"
```

## 📊 Dashboard Features

### Real-Time Monitoring
- Live WebSocket updates
- Consent flow visualization
- Error rate trending
- Performance graphs

### Historical Analysis
- 30-day metric retention
- Trend analysis
- Comparison views
- Export capabilities

## 🔧 Configuration

### Environment Variables
```bash
# Database
DATABASE_URL=postgresql://localhost/semantest_monitoring

# Server
PORT=3001
NODE_ENV=production

# Alerts
SLACK_WEBHOOK=https://hooks.slack.com/...
PAGERDUTY_KEY=your-key

# Security
API_KEY=generate-secure-key
CORS_ORIGIN=https://your-domain.com
```

### Alert Customization
Edit `monitoring/alerts.yaml`:
```yaml
custom_alert:
  name: "Your Alert"
  condition: "metric > threshold"
  severity: "warning|high|critical"
  action: "notify|page|block"
```

## 📱 Mobile Dashboard

Access monitoring on mobile:
1. Navigate to http://your-server:3001
2. Add to home screen
3. Real-time updates work on mobile

## 🔒 Security

### Authentication
- API key required for write operations
- Read-only dashboard by default
- OAuth integration available

### Data Privacy
- No PII in metrics
- Consent required for user data
- 30-day auto-deletion
- GDPR compliant

## 🚦 Health Checks

### Monitoring Health
```bash
curl http://localhost:3001/health
```

### Extension Health
- Check consent popup: 100% display rate expected
- Error rate: <1% threshold
- Performance: <3s load time

## 📈 Scaling

### High Volume
- Add Redis for caching
- Use PostgreSQL read replicas
- Implement metric aggregation
- Add CDN for dashboard

### Multi-Region
- Deploy monitoring per region
- Aggregate at global level
- Use geo-DNS for routing

## 🛠️ Troubleshooting

### Common Issues

**Dashboard not loading**
- Check server logs: `npm run logs`
- Verify database connection
- Check firewall rules

**No metrics appearing**
- Verify extension has v1.0.1+
- Check consent status
- Validate API endpoint

**High memory usage**
- Reduce metric retention
- Enable aggregation
- Add Redis caching

## 📞 Support

- **GitHub Issues**: Report bugs
- **Discord**: Real-time help
- **Email**: monitoring@semantest.com

---

**Version**: 1.0.2
**Updated**: January 2025
**Status**: Production Ready