/**
 * Beta Metrics Tracker for ChatGPT Extension
 * HIGH PRIORITY metrics collection for beta launch
 */

class BetaMetricsTracker {
  constructor() {
    this.metricsEndpoint = 'https://analytics.semantest.com/v1/beta';
    this.version = '1.0.0-beta';
    this.metrics = {
      installCount: 0,
      activeUsers: new Set(),
      errorReports: [],
      userFeedback: []
    };
  }

  /**
   * 1) INSTALL COUNT TRACKING
   */
  trackInstall() {
    // Called on extension install
    chrome.runtime.onInstalled.addListener((details) => {
      if (details.reason === 'install') {
        this.sendMetric('install', {
          timestamp: Date.now(),
          version: this.version,
          browser: this.getBrowserInfo(),
          installId: this.generateInstallId()
        });
      }
    });
  }

  /**
   * 2) ACTIVE USERS TRACKING
   */
  trackActiveUser() {
    // Track daily active users
    chrome.storage.local.get(['userId', 'lastActiveDate'], (data) => {
      const today = new Date().toDateString();
      const userId = data.userId || this.generateUserId();
      
      if (data.lastActiveDate !== today) {
        // New active user for today
        this.sendMetric('daily_active_user', {
          userId: userId,
          date: today,
          sessionCount: 1,
          features_used: []
        });
        
        chrome.storage.local.set({ 
          userId: userId,
          lastActiveDate: today 
        });
      }
    });
    
    // Track session start
    this.sendMetric('session_start', {
      timestamp: Date.now(),
      sessionId: this.generateSessionId()
    });
  }

  /**
   * 3) ERROR REPORTS TRACKING
   */
  trackError(error, context = {}) {
    const errorReport = {
      timestamp: Date.now(),
      message: error.message || String(error),
      stack: error.stack,
      type: error.name || 'UnknownError',
      severity: this.calculateSeverity(error),
      context: {
        url: window.location?.href,
        userAgent: navigator.userAgent,
        version: this.version,
        ...context
      }
    };

    // Send immediately for critical errors
    if (errorReport.severity === 'critical') {
      this.sendMetric('critical_error', errorReport);
    } else {
      // Batch non-critical errors
      this.errorReports.push(errorReport);
      this.scheduleErrorBatch();
    }
  }

  /**
   * 4) USER FEEDBACK TRACKING
   */
  trackUserFeedback(feedback) {
    const feedbackData = {
      timestamp: Date.now(),
      type: feedback.type, // 'bug', 'feature_request', 'general'
      rating: feedback.rating, // 1-5 stars
      message: feedback.message,
      email: feedback.email || null,
      version: this.version,
      metadata: {
        browser: this.getBrowserInfo(),
        features_used: this.getUsedFeatures(),
        session_duration: this.getSessionDuration()
      }
    };

    this.sendMetric('user_feedback', feedbackData);
    
    // Show confirmation to user
    this.showFeedbackConfirmation(feedback.type);
  }

  /**
   * REAL-TIME DASHBOARD METRICS
   */
  sendToDashboard(metricType, data) {
    // Send to WebSocket for real-time dashboard update
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({
        type: 'beta_metric',
        metric: metricType,
        data: data
      }));
    }
  }

  /**
   * METRIC AGGREGATION
   */
  async getDashboardMetrics() {
    try {
      const response = await fetch(`${this.metricsEndpoint}/dashboard`);
      const data = await response.json();
      
      return {
        installCount: data.total_installs,
        activeUsersToday: data.active_users_today,
        activeUsers7Days: data.active_users_7days,
        errorRate: data.error_rate,
        criticalErrors: data.critical_errors_24h,
        userSatisfaction: data.avg_rating,
        topErrors: data.top_errors,
        feedbackSummary: data.feedback_summary
      };
    } catch (error) {
      console.error('Failed to fetch dashboard metrics:', error);
      return null;
    }
  }

  /**
   * AUTOMATED ALERTS
   */
  setupAlerts() {
    // Check metrics every 5 minutes
    setInterval(async () => {
      const metrics = await this.getDashboardMetrics();
      if (!metrics) return;

      // Alert on high error rate
      if (metrics.errorRate > 5) {
        this.sendAlert('high_error_rate', {
          rate: metrics.errorRate,
          threshold: 5,
          action: 'investigate_immediately'
        });
      }

      // Alert on critical errors
      if (metrics.criticalErrors > 0) {
        this.sendAlert('critical_errors_detected', {
          count: metrics.criticalErrors,
          topErrors: metrics.topErrors
        });
      }

      // Alert on low satisfaction
      if (metrics.userSatisfaction < 3.5) {
        this.sendAlert('low_user_satisfaction', {
          rating: metrics.userSatisfaction,
          feedback: metrics.feedbackSummary
        });
      }
    }, 5 * 60 * 1000); // 5 minutes
  }

  /**
   * HELPER METHODS
   */
  sendMetric(type, data) {
    fetch(`${this.metricsEndpoint}/${type}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...data,
        _metadata: {
          version: this.version,
          timestamp: Date.now(),
          environment: 'beta'
        }
      })
    }).catch(error => {
      console.error(`Failed to send ${type} metric:`, error);
    });

    // Also send to real-time dashboard
    this.sendToDashboard(type, data);
  }

  calculateSeverity(error) {
    if (error.critical || error.message?.includes('CRITICAL')) return 'critical';
    if (error.stack?.includes('TypeError')) return 'high';
    if (error.stack?.includes('ReferenceError')) return 'high';
    return 'medium';
  }

  generateInstallId() {
    return `install-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  generateUserId() {
    return `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  generateSessionId() {
    return `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  getBrowserInfo() {
    const ua = navigator.userAgent;
    return {
      chrome_version: ua.match(/Chrome\/(\d+)/)?.[1] || 'unknown',
      platform: navigator.platform
    };
  }

  getUsedFeatures() {
    // Return list of features used in current session
    return chrome.storage.local.get('used_features')
      .then(data => data.used_features || []);
  }

  getSessionDuration() {
    // Calculate session duration
    const sessionStart = parseInt(sessionStorage.getItem('session_start') || Date.now());
    return Date.now() - sessionStart;
  }

  showFeedbackConfirmation(type) {
    // Show user that feedback was received
    chrome.notifications.create({
      type: 'basic',
      iconUrl: 'icon128.png',
      title: 'Thank you for your feedback!',
      message: `Your ${type} report has been sent to the development team.`
    });
  }

  sendAlert(alertType, data) {
    // Send critical alerts to development team
    fetch(`${this.metricsEndpoint}/alerts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: alertType,
        severity: 'high',
        data: data,
        timestamp: Date.now()
      })
    });
  }
}

// Initialize tracker
const betaTracker = new BetaMetricsTracker();
export default betaTracker;