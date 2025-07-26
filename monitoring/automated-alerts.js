/**
 * Automated Alert System
 * Monitors critical metrics and sends alerts
 */

class AutomatedAlerts {
  constructor() {
    this.alerts = [];
    this.channels = {
      email: true,
      slack: true,
      dashboard: true
    };
    this.alertRules = this.defineAlertRules();
    this.alertEndpoint = 'https://monitoring.semantest.com/alerts';
  }

  defineAlertRules() {
    return [
      {
        id: 'high_error_rate',
        name: 'High Error Rate',
        condition: (metrics) => metrics.errorRate > 5, // 5%
        severity: 'critical',
        message: 'Error rate exceeded 5%',
        cooldown: 300000 // 5 minutes
      },
      {
        id: 'slow_performance',
        name: 'Performance Degradation',
        condition: (metrics) => metrics.avgLoadTime > 3000,
        severity: 'warning',
        message: 'Average load time exceeded 3 seconds',
        cooldown: 600000 // 10 minutes
      },
      {
        id: 'memory_leak',
        name: 'Potential Memory Leak',
        condition: (metrics) => metrics.memoryGrowthRate > 10, // 10MB/hour
        severity: 'warning',
        message: 'Memory usage growing rapidly',
        cooldown: 1800000 // 30 minutes
      },
      {
        id: 'api_failures',
        name: 'API Failures',
        condition: (metrics) => metrics.apiFailureRate > 10, // 10%
        severity: 'critical',
        message: 'API failure rate exceeded 10%',
        cooldown: 300000 // 5 minutes
      },
      {
        id: 'consent_issues',
        name: 'Consent Popup Issues',
        condition: (metrics) => metrics.consentPopupFailures > 5,
        severity: 'high',
        message: 'Multiple consent popup failures detected',
        cooldown: 600000 // 10 minutes
      },
      {
        id: 'crash_detected',
        name: 'Extension Crash',
        condition: (metrics) => metrics.crashCount > 0,
        severity: 'critical',
        message: 'Extension crash detected',
        cooldown: 60000 // 1 minute
      },
      {
        id: 'user_surge',
        name: 'User Surge',
        condition: (metrics) => metrics.activeUsers > metrics.avgUsers * 2,
        severity: 'info',
        message: 'User activity doubled - scaling may be needed',
        cooldown: 1800000 // 30 minutes
      },
      {
        id: 'storage_quota',
        name: 'Storage Quota Warning',
        condition: (metrics) => metrics.storageUsage > 0.8, // 80%
        severity: 'warning',
        message: 'Storage usage exceeded 80%',
        cooldown: 3600000 // 1 hour
      }
    ];
  }

  initialize() {
    // Start monitoring
    this.startMonitoring();
    
    // Set up metric collection
    this.collectMetrics();
    
    console.log('[Semantest] Automated alerts initialized');
  }

  startMonitoring() {
    // Check alerts every minute
    setInterval(() => {
      this.checkAlerts();
    }, 60000);
    
    // Immediate check
    this.checkAlerts();
  }

  async collectMetrics() {
    // Collect metrics from various sources
    const metrics = {
      errorRate: await this.getErrorRate(),
      avgLoadTime: await this.getAverageLoadTime(),
      memoryGrowthRate: await this.getMemoryGrowthRate(),
      apiFailureRate: await this.getAPIFailureRate(),
      consentPopupFailures: await this.getConsentPopupFailures(),
      crashCount: await this.getCrashCount(),
      activeUsers: await this.getActiveUsers(),
      avgUsers: await this.getAverageUsers(),
      storageUsage: await this.getStorageUsage(),
      timestamp: Date.now()
    };
    
    return metrics;
  }

  async checkAlerts() {
    const metrics = await this.collectMetrics();
    
    for (const rule of this.alertRules) {
      if (this.shouldTriggerAlert(rule, metrics)) {
        this.triggerAlert(rule, metrics);
      }
    }
  }

  shouldTriggerAlert(rule, metrics) {
    // Check if condition is met
    if (!rule.condition(metrics)) {
      return false;
    }
    
    // Check cooldown
    const lastAlert = this.alerts.find(a => a.ruleId === rule.id);
    if (lastAlert) {
      const timeSinceLastAlert = Date.now() - lastAlert.timestamp;
      if (timeSinceLastAlert < rule.cooldown) {
        return false; // Still in cooldown
      }
    }
    
    return true;
  }

  triggerAlert(rule, metrics) {
    const alert = {
      id: this.generateAlertId(),
      ruleId: rule.id,
      name: rule.name,
      severity: rule.severity,
      message: rule.message,
      metrics: this.sanitizeMetrics(metrics),
      timestamp: Date.now(),
      version: chrome.runtime.getManifest().version
    };
    
    // Store alert
    this.alerts.push(alert);
    
    // Send alert through channels
    this.sendAlert(alert);
    
    // Keep only last 100 alerts
    if (this.alerts.length > 100) {
      this.alerts = this.alerts.slice(-100);
    }
  }

  async sendAlert(alert) {
    // Send to monitoring backend
    try {
      const response = await fetch(this.alertEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Alert-Severity': alert.severity
        },
        body: JSON.stringify(alert)
      });
      
      if (!response.ok) {
        console.error('[Semantest] Failed to send alert:', response.status);
      }
    } catch (error) {
      console.error('[Semantest] Alert sending failed:', error);
    }
    
    // Log to console for debugging
    console.warn(`[Semantest Alert] ${alert.severity.toUpperCase()}: ${alert.message}`);
    
    // Chrome notification for critical alerts
    if (alert.severity === 'critical' && chrome.notifications) {
      chrome.notifications.create({
        type: 'basic',
        iconUrl: chrome.runtime.getURL('assets/icon128.png'),
        title: 'Semantest Critical Alert',
        message: alert.message,
        priority: 2
      });
    }
  }

  sanitizeMetrics(metrics) {
    // Remove any potentially sensitive data
    const sanitized = { ...metrics };
    delete sanitized.userData;
    delete sanitized.sessionIds;
    return sanitized;
  }

  generateAlertId() {
    return 'alert_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  // Metric collection methods
  async getErrorRate() {
    // Calculate error rate from error tracking
    const errors = window.errorDashboard?.getErrorSummary() || { total: 0 };
    const totalOperations = window.userMetrics?.metrics.sessions || 1;
    return (errors.total / totalOperations) * 100;
  }

  async getAverageLoadTime() {
    // Get from performance monitor
    return window.semantestPerformance?.metrics.loadTime.duration || 0;
  }

  async getMemoryGrowthRate() {
    // Calculate memory growth rate (MB/hour)
    const current = window.semantestPerformance?.metrics.memoryUsage.used || 0;
    const previous = this.previousMemory || current;
    this.previousMemory = current;
    
    const growth = (current - previous) / (1024 * 1024); // Convert to MB
    return growth * 60; // Extrapolate to hourly rate
  }

  async getAPIFailureRate() {
    // Calculate API failure rate
    const apiMetrics = window.semantestPerformance?.metrics.apiCalls || {};
    let totalCalls = 0;
    let failures = 0;
    
    Object.values(apiMetrics).forEach(metric => {
      totalCalls += metric.count;
      // Assume calls over 5s are failures
      failures += metric.maxDuration > 5000 ? 1 : 0;
    });
    
    return totalCalls > 0 ? (failures / totalCalls) * 100 : 0;
  }

  async getConsentPopupFailures() {
    // Track consent popup issues
    const errors = window.errorDashboard?.errors || [];
    return errors.filter(e => e.message?.includes('consent')).length;
  }

  async getCrashCount() {
    // Check for extension crashes
    const errors = window.errorDashboard?.errors || [];
    return errors.filter(e => e.type === 'crash' || e.message?.includes('crash')).length;
  }

  async getActiveUsers() {
    // Get active user count (simulated for now)
    return window.userMetrics?.metrics.sessions || 0;
  }

  async getAverageUsers() {
    // Historical average (simulated)
    return 100; // Baseline for comparison
  }

  async getStorageUsage() {
    // Check Chrome storage usage
    return new Promise((resolve) => {
      chrome.storage.local.getBytesInUse((bytesInUse) => {
        const quota = chrome.storage.local.QUOTA_BYTES;
        resolve(bytesInUse / quota);
      });
    });
  }

  // Alert management methods
  getActiveAlerts() {
    const now = Date.now();
    return this.alerts.filter(alert => {
      const age = now - alert.timestamp;
      return age < 3600000; // Active if less than 1 hour old
    });
  }

  acknowledgeAlert(alertId) {
    const alert = this.alerts.find(a => a.id === alertId);
    if (alert) {
      alert.acknowledged = true;
      alert.acknowledgedAt = Date.now();
    }
  }

  getAlertSummary() {
    const summary = {
      total: this.alerts.length,
      active: this.getActiveAlerts().length,
      bySeverity: {},
      recent: this.alerts.slice(-10)
    };
    
    this.alerts.forEach(alert => {
      summary.bySeverity[alert.severity] = (summary.bySeverity[alert.severity] || 0) + 1;
    });
    
    return summary;
  }
}

// Initialize automated alerts
const automatedAlerts = new AutomatedAlerts();
automatedAlerts.initialize();