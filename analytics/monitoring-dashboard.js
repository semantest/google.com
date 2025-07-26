/**
 * ChatGPT Extension Monitoring Dashboard
 * Real-time analytics visualization and crash reporting
 */

class MonitoringDashboard {
  constructor() {
    this.apiEndpoint = 'https://analytics.semantest.com/v1';
    this.refreshInterval = 5000; // 5 seconds
    this.timeRange = '24h';
    this.charts = {};
    this.ws = null;
    
    this.initialize();
  }

  async initialize() {
    // Set up WebSocket for real-time updates
    this.connectWebSocket();
    
    // Initialize charts
    this.initializeCharts();
    
    // Load initial data
    await this.loadDashboardData();
    
    // Set up auto-refresh
    this.startAutoRefresh();
    
    // Set up event listeners
    this.setupEventListeners();
  }

  connectWebSocket() {
    this.ws = new WebSocket('wss://analytics.semantest.com/realtime');
    
    this.ws.onopen = () => {
      console.log('Connected to real-time analytics');
      this.updateConnectionStatus('connected');
    };
    
    this.ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      this.handleRealtimeUpdate(data);
    };
    
    this.ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      this.updateConnectionStatus('error');
    };
    
    this.ws.onclose = () => {
      console.log('WebSocket connection closed');
      this.updateConnectionStatus('disconnected');
      // Reconnect after 5 seconds
      setTimeout(() => this.connectWebSocket(), 5000);
    };
  }

  async loadDashboardData() {
    try {
      // Load all metrics in parallel
      const [metrics, crashes, events, features] = await Promise.all([
        this.fetchMetrics(),
        this.fetchCrashes(),
        this.fetchEvents(),
        this.fetchFeatureUsage()
      ]);
      
      // Update UI
      this.updateMetrics(metrics);
      this.updateCrashFeed(crashes);
      this.updateEventFeed(events);
      this.updateCharts({ metrics, features });
      
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      this.showError('Failed to load dashboard data');
    }
  }

  async fetchMetrics() {
    const response = await fetch(`${this.apiEndpoint}/metrics?range=${this.timeRange}`);
    return response.json();
  }

  async fetchCrashes() {
    const response = await fetch(`${this.apiEndpoint}/crashes?range=${this.timeRange}&limit=20`);
    return response.json();
  }

  async fetchEvents() {
    const response = await fetch(`${this.apiEndpoint}/events?range=${this.timeRange}&limit=50`);
    return response.json();
  }

  async fetchFeatureUsage() {
    const response = await fetch(`${this.apiEndpoint}/features?range=${this.timeRange}`);
    return response.json();
  }

  updateMetrics(metrics) {
    // Update metric cards
    this.updateMetricCard('activeUsers', metrics.activeUsers, metrics.activeUsersChange);
    this.updateMetricCard('totalEvents', this.formatNumber(metrics.totalEvents), metrics.totalEventsChange);
    this.updateMetricCard('crashRate', `${metrics.crashRate.toFixed(2)}%`, metrics.crashRateChange, true);
    this.updateMetricCard('avgResponseTime', `${Math.round(metrics.avgResponseTime)}ms`, metrics.responseTimeChange);
  }

  updateMetricCard(id, value, change, isPercentage = false) {
    const valueEl = document.getElementById(id);
    const changeEl = document.getElementById(`${id}Change`);
    
    if (valueEl) valueEl.textContent = value;
    
    if (changeEl && change !== undefined) {
      const isNegative = change < 0;
      const changeText = isPercentage ? 
        `${isNegative ? '' : '+'}${change.toFixed(1)}%` :
        `${isNegative ? '' : '+'}${change}%`;
      
      changeEl.textContent = changeText + ' from yesterday';
      changeEl.className = `metric-change ${isNegative ? 'negative' : ''}`;
    }
  }

  updateCrashFeed(crashes) {
    const feed = document.getElementById('crashFeed');
    if (!crashes || crashes.length === 0) {
      feed.innerHTML = '<div class="feed-item">No crashes reported</div>';
      return;
    }
    
    feed.innerHTML = crashes.map(crash => `
      <div class="feed-item">
        <div>
          <span class="status-indicator status-error"></span>
          <strong>${crash.message || 'Unknown error'}</strong>
          <div style="font-size: 12px; color: #95a5a6; margin-top: 4px;">
            ${crash.source || 'Unknown source'} • Line ${crash.line || '?'}
            ${crash.version ? ` • v${crash.version}` : ''}
          </div>
        </div>
        <span class="feed-time">${this.formatTime(crash.timestamp)}</span>
      </div>
    `).join('');
  }

  updateEventFeed(events) {
    const feed = document.getElementById('eventFeed');
    if (!events || events.length === 0) {
      feed.innerHTML = '<div class="feed-item">No events recorded</div>';
      return;
    }
    
    feed.innerHTML = events.map(event => {
      const icon = this.getEventIcon(event.name);
      return `
        <div class="feed-item">
          <div>
            <span class="status-indicator ${icon.class}"></span>
            <strong>${event.name}</strong>
            ${event.properties?.feature ? ` - ${event.properties.feature}` : ''}
          </div>
          <span class="feed-time">${this.formatTime(event.timestamp)}</span>
        </div>
      `;
    }).join('');
  }

  initializeCharts() {
    // Real-time activity chart
    const realTimeCtx = document.getElementById('realTimeChart').getContext('2d');
    this.charts.realTime = new Chart(realTimeCtx, {
      type: 'line',
      data: {
        labels: [],
        datasets: [{
          label: 'Events per minute',
          data: [],
          borderColor: '#3498db',
          backgroundColor: 'rgba(52, 152, 219, 0.1)',
          tension: 0.4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true
          }
        },
        plugins: {
          legend: {
            display: false
          }
        }
      }
    });

    // Feature usage chart
    const featureCtx = document.getElementById('featureChart').getContext('2d');
    this.charts.feature = new Chart(featureCtx, {
      type: 'bar',
      data: {
        labels: [],
        datasets: [{
          label: 'Usage Count',
          data: [],
          backgroundColor: '#3498db'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          }
        }
      }
    });

    // Browser distribution chart
    const browserCtx = document.getElementById('browserChart').getContext('2d');
    this.charts.browser = new Chart(browserCtx, {
      type: 'doughnut',
      data: {
        labels: [],
        datasets: [{
          data: [],
          backgroundColor: [
            '#3498db',
            '#2ecc71',
            '#f39c12',
            '#e74c3c',
            '#9b59b6'
          ]
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false
      }
    });
  }

  updateCharts(data) {
    // Update real-time chart
    if (data.metrics.timeline) {
      const labels = data.metrics.timeline.map(point => 
        new Date(point.timestamp).toLocaleTimeString()
      );
      const values = data.metrics.timeline.map(point => point.events);
      
      this.charts.realTime.data.labels = labels;
      this.charts.realTime.data.datasets[0].data = values;
      this.charts.realTime.update();
    }

    // Update feature chart
    if (data.features) {
      const sortedFeatures = Object.entries(data.features)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10);
      
      this.charts.feature.data.labels = sortedFeatures.map(f => f[0]);
      this.charts.feature.data.datasets[0].data = sortedFeatures.map(f => f[1]);
      this.charts.feature.update();
    }

    // Update browser chart
    if (data.metrics.browsers) {
      this.charts.browser.data.labels = Object.keys(data.metrics.browsers);
      this.charts.browser.data.datasets[0].data = Object.values(data.metrics.browsers);
      this.charts.browser.update();
    }
  }

  handleRealtimeUpdate(data) {
    switch (data.type) {
      case 'event':
        this.addEventToFeed(data.event);
        this.updateRealTimeChart(data.event);
        break;
      case 'crash':
        this.addCrashToFeed(data.crash);
        this.incrementCrashRate();
        break;
      case 'metric':
        this.updateMetricValue(data.metric);
        break;
    }
  }

  addEventToFeed(event) {
    const feed = document.getElementById('eventFeed');
    const feedItem = document.createElement('div');
    feedItem.className = 'feed-item';
    feedItem.style.animation = 'slideIn 0.3s ease-out';
    
    const icon = this.getEventIcon(event.name);
    feedItem.innerHTML = `
      <div>
        <span class="status-indicator ${icon.class}"></span>
        <strong>${event.name}</strong>
        ${event.properties?.feature ? ` - ${event.properties.feature}` : ''}
      </div>
      <span class="feed-time">just now</span>
    `;
    
    feed.insertBefore(feedItem, feed.firstChild);
    
    // Limit feed items
    while (feed.children.length > 50) {
      feed.removeChild(feed.lastChild);
    }
  }

  addCrashToFeed(crash) {
    const feed = document.getElementById('crashFeed');
    const feedItem = document.createElement('div');
    feedItem.className = 'feed-item';
    feedItem.style.animation = 'slideIn 0.3s ease-out';
    
    feedItem.innerHTML = `
      <div>
        <span class="status-indicator status-error"></span>
        <strong>${crash.message || 'Unknown error'}</strong>
        <div style="font-size: 12px; color: #95a5a6; margin-top: 4px;">
          ${crash.source || 'Unknown source'} • Line ${crash.line || '?'}
          ${crash.version ? ` • v${crash.version}` : ''}
        </div>
      </div>
      <span class="feed-time">just now</span>
    `;
    
    feed.insertBefore(feedItem, feed.firstChild);
    
    // Limit feed items
    while (feed.children.length > 20) {
      feed.removeChild(feed.lastChild);
    }
  }

  getEventIcon(eventName) {
    const eventTypes = {
      'session_start': { class: 'status-healthy' },
      'feature_used': { class: 'status-healthy' },
      'api_request_complete': { class: 'status-healthy' },
      'api_request_failed': { class: 'status-error' },
      'performance_metric': { class: 'status-warning' },
      'error': { class: 'status-error' }
    };
    
    return eventTypes[eventName] || { class: 'status-healthy' };
  }

  formatTime(timestamp) {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    
    if (diff < 60000) return 'just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return date.toLocaleDateString();
  }

  formatNumber(num) {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  }

  startAutoRefresh() {
    setInterval(() => {
      this.loadDashboardData();
    }, this.refreshInterval);
  }

  setupEventListeners() {
    // Handle manual refresh
    window.refreshDashboard = () => {
      this.loadDashboardData();
    };
    
    // Handle time range changes
    window.updateTimeRange = () => {
      const select = document.getElementById('timeRange');
      this.timeRange = select.value;
      this.loadDashboardData();
    };
    
    // Handle data export
    window.exportData = async () => {
      try {
        const data = await this.fetchMetrics();
        const blob = new Blob([JSON.stringify(data, null, 2)], 
          { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `analytics-export-${new Date().toISOString()}.json`;
        a.click();
      } catch (error) {
        this.showError('Failed to export data');
      }
    };
  }

  showError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = message;
    document.querySelector('.dashboard').insertBefore(
      errorDiv, 
      document.querySelector('.controls')
    );
    
    setTimeout(() => errorDiv.remove(), 5000);
  }

  updateConnectionStatus(status) {
    // Update UI to show WebSocket connection status
    const indicator = document.querySelector('.connection-status');
    if (indicator) {
      indicator.className = `connection-status status-${status}`;
    }
  }
}

// Initialize dashboard when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  new MonitoringDashboard();
});

// Add slide-in animation
const style = document.createElement('style');
style.textContent = `
  @keyframes slideIn {
    from {
      opacity: 0;
      transform: translateY(-10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;
document.head.appendChild(style);