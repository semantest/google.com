/**
 * ChatGPT Extension Analytics Integration
 * Tracks user interactions, performance metrics, and crash reporting
 */

class ExtensionAnalytics {
  constructor() {
    this.analyticsEndpoint = 'https://analytics.semantest.com/v1/events';
    this.crashEndpoint = 'https://analytics.semantest.com/v1/crashes';
    this.sessionId = this.generateSessionId();
    this.userId = null;
    this.version = chrome.runtime.getManifest().version;
    this.environment = this.version.includes('beta') ? 'beta' : 'production';
  }

  /**
   * Initialize analytics on extension startup
   */
  async initialize() {
    // Get or create user ID
    const { userId } = await chrome.storage.local.get('userId');
    if (!userId) {
      this.userId = this.generateUserId();
      await chrome.storage.local.set({ userId: this.userId });
    } else {
      this.userId = userId;
    }

    // Set up error handlers
    this.setupCrashReporting();
    
    // Track session start
    this.trackEvent('session_start', {
      version: this.version,
      environment: this.environment,
      browser: this.getBrowserInfo()
    });

    // Set up performance monitoring
    this.setupPerformanceMonitoring();
  }

  /**
   * Track custom events
   */
  trackEvent(eventName, properties = {}) {
    const event = {
      name: eventName,
      timestamp: Date.now(),
      sessionId: this.sessionId,
      userId: this.userId,
      version: this.version,
      environment: this.environment,
      properties: {
        ...properties,
        url: window.location.href,
        userAgent: navigator.userAgent
      }
    };

    // Send to analytics endpoint
    this.sendAnalytics(event);
  }

  /**
   * Track feature usage
   */
  trackFeature(featureName, metadata = {}) {
    this.trackEvent('feature_used', {
      feature: featureName,
      ...metadata
    });
  }

  /**
   * Track performance metrics
   */
  trackPerformance(metricName, value, unit = 'ms') {
    this.trackEvent('performance_metric', {
      metric: metricName,
      value: value,
      unit: unit
    });
  }

  /**
   * Set up crash reporting
   */
  setupCrashReporting() {
    // Global error handler
    window.addEventListener('error', (event) => {
      this.reportCrash({
        message: event.message,
        source: event.filename,
        line: event.lineno,
        column: event.colno,
        stack: event.error?.stack,
        type: 'uncaught_error'
      });
    });

    // Promise rejection handler
    window.addEventListener('unhandledrejection', (event) => {
      this.reportCrash({
        message: event.reason?.message || String(event.reason),
        stack: event.reason?.stack,
        type: 'unhandled_rejection'
      });
    });
  }

  /**
   * Report crash to backend
   */
  reportCrash(crashData) {
    const crash = {
      ...crashData,
      timestamp: Date.now(),
      sessionId: this.sessionId,
      userId: this.userId,
      version: this.version,
      environment: this.environment,
      browser: this.getBrowserInfo(),
      context: {
        url: window.location.href,
        memory: this.getMemoryInfo(),
        activeFeatures: this.getActiveFeatures()
      }
    };

    // Send to crash endpoint
    fetch(this.crashEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(crash)
    }).catch(console.error);
  }

  /**
   * Set up performance monitoring
   */
  setupPerformanceMonitoring() {
    // Monitor extension startup time
    if (chrome.runtime?.onStartup) {
      const startTime = performance.now();
      chrome.runtime.onStartup.addListener(() => {
        const startupTime = performance.now() - startTime;
        this.trackPerformance('extension_startup', startupTime);
      });
    }

    // Monitor API response times
    this.monitorApiPerformance();
  }

  /**
   * Monitor API performance
   */
  monitorApiPerformance() {
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      const startTime = performance.now();
      const url = args[0];
      
      try {
        const response = await originalFetch.apply(window, args);
        const duration = performance.now() - startTime;
        
        this.trackPerformance('api_request', duration, 'ms');
        this.trackEvent('api_request_complete', {
          url: typeof url === 'string' ? url : url.url,
          status: response.status,
          duration: duration
        });
        
        return response;
      } catch (error) {
        const duration = performance.now() - startTime;
        this.trackEvent('api_request_failed', {
          url: typeof url === 'string' ? url : url.url,
          error: error.message,
          duration: duration
        });
        throw error;
      }
    };
  }

  /**
   * Send analytics data
   */
  async sendAnalytics(data) {
    try {
      // Batch events for efficiency
      if (!this.eventQueue) {
        this.eventQueue = [];
      }
      
      this.eventQueue.push(data);
      
      // Send batch every 10 events or 5 seconds
      if (this.eventQueue.length >= 10) {
        this.flushEvents();
      } else if (!this.flushTimer) {
        this.flushTimer = setTimeout(() => this.flushEvents(), 5000);
      }
    } catch (error) {
      console.error('Analytics error:', error);
    }
  }

  /**
   * Flush event queue
   */
  async flushEvents() {
    if (!this.eventQueue || this.eventQueue.length === 0) return;
    
    const events = [...this.eventQueue];
    this.eventQueue = [];
    clearTimeout(this.flushTimer);
    this.flushTimer = null;
    
    try {
      await fetch(this.analyticsEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ events })
      });
    } catch (error) {
      // Re-queue events on failure
      this.eventQueue.unshift(...events);
    }
  }

  /**
   * Helper methods
   */
  generateSessionId() {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  generateUserId() {
    return `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  getBrowserInfo() {
    return {
      name: navigator.userAgent.includes('Chrome') ? 'Chrome' : 'Unknown',
      version: navigator.userAgent.match(/Chrome\/(\d+)/)?.[1] || 'Unknown',
      platform: navigator.platform
    };
  }

  getMemoryInfo() {
    if (performance.memory) {
      return {
        usedJSHeapSize: Math.round(performance.memory.usedJSHeapSize / 1048576),
        totalJSHeapSize: Math.round(performance.memory.totalJSHeapSize / 1048576),
        limit: Math.round(performance.memory.jsHeapSizeLimit / 1048576)
      };
    }
    return null;
  }

  getActiveFeatures() {
    // Return list of active features based on storage
    return [];
  }
}

// Export for use in extension
const analytics = new ExtensionAnalytics();
export default analytics;