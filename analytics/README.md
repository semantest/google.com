# ChatGPT Extension Analytics & Monitoring

## Overview

Complete analytics and crash reporting solution for ChatGPT Extension beta release.

## Components

### 1. Analytics Integration (`analytics-integration.js`)
- Event tracking
- Performance monitoring  
- Crash reporting
- User behavior analytics
- API performance tracking

### 2. Monitoring Dashboard (`monitoring-dashboard.html`)
- Real-time metrics visualization
- Live event stream
- Crash reporting feed
- Performance charts
- Browser distribution analytics

### 3. Dashboard Backend (`monitoring-dashboard.js`)
- WebSocket real-time updates
- Chart.js visualizations
- Auto-refresh functionality
- Data export capabilities

## Key Features

### Analytics Tracking
- **Session Management**: Unique session and user IDs
- **Event Tracking**: Custom events with properties
- **Performance Metrics**: API response times, startup performance
- **Crash Reporting**: Automatic error and crash detection
- **Feature Usage**: Track which features users interact with

### Monitoring Dashboard
- **Real-time Updates**: WebSocket connection for live data
- **Key Metrics**: Active users, events, crash rate, response times
- **Visual Charts**: Activity timeline, feature usage, browser stats
- **Live Feeds**: Recent crashes and events
- **Data Export**: Export analytics data as JSON

## Integration Instructions

### 1. Add to Extension Manifest
```json
{
  "content_security_policy": {
    "extension_pages": "script-src 'self'; object-src 'self'; connect-src https://analytics.semantest.com wss://analytics.semantest.com"
  }
}
```

### 2. Initialize in Background Script
```javascript
import analytics from './analytics/analytics-integration.js';

// Initialize on extension startup
chrome.runtime.onInstalled.addListener(() => {
  analytics.initialize();
});

// Track custom events
analytics.trackEvent('extension_installed', {
  version: chrome.runtime.getManifest().version
});

// Track feature usage
analytics.trackFeature('project_created', {
  projectType: 'custom'
});
```

### 3. Add to Content Scripts
```javascript
// Track user interactions
document.addEventListener('click', (e) => {
  if (e.target.matches('.important-button')) {
    analytics.trackEvent('button_clicked', {
      button: e.target.textContent
    });
  }
});
```

## Dashboard Access

1. Host the dashboard files on your analytics server
2. Access at: `https://analytics.semantest.com/dashboard`
3. Dashboard auto-connects to WebSocket for real-time updates

## Beta Metrics to Track

### User Engagement
- Daily active users
- Session duration
- Feature adoption rate
- User retention

### Performance
- Extension startup time
- API response times
- Memory usage
- Page load impact

### Reliability
- Crash rate
- Error frequency
- Success rate of operations
- Recovery time

### Feature Usage
- Most used features
- Feature discovery rate
- User workflow patterns
- Abandonment points

## Security Considerations

- All data transmitted over HTTPS/WSS
- User IDs are anonymous
- No personally identifiable information collected
- Configurable data retention policies
- GDPR compliant data handling

## Deployment

1. Set up analytics backend at `analytics.semantest.com`
2. Configure CORS for extension origin
3. Set up WebSocket server for real-time updates
4. Deploy dashboard to analytics subdomain
5. Configure data retention and backup policies

## Next Steps

1. Implement backend API endpoints
2. Set up data storage (TimeSeries DB recommended)
3. Configure alerting for critical metrics
4. Create automated reports for stakeholders
5. Set up A/B testing framework