/**
 * User Metrics Collection (Privacy-First)
 * Only collects metrics with explicit user consent
 */

class UserMetrics {
  constructor() {
    this.metrics = {
      sessions: 0,
      features: {},
      performance: {},
      errors: 0
    };
    this.consentStatus = false;
    this.metricsEndpoint = 'https://monitoring.semantest.com/metrics';
  }

  async initialize() {
    // Always check consent first
    this.consentStatus = await this.checkConsent();
    
    if (this.consentStatus) {
      this.startSession();
      this.setupEventListeners();
      console.log('[Semantest] Metrics collection enabled');
    } else {
      console.log('[Semantest] Metrics collection disabled - respecting user privacy');
    }
  }

  async checkConsent() {
    return new Promise((resolve) => {
      chrome.storage.local.get(['telemetryConsent'], (result) => {
        resolve(result.telemetryConsent === true);
      });
    });
  }

  startSession() {
    if (!this.consentStatus) return;
    
    this.metrics.sessions++;
    this.metrics.sessionStart = Date.now();
    
    // Track session without PII
    this.track('session_start', {
      version: chrome.runtime.getManifest().version,
      timestamp: new Date().toISOString()
    });
  }

  setupEventListeners() {
    // Listen for consent changes
    chrome.storage.onChanged.addListener((changes, area) => {
      if (area === 'local' && changes.telemetryConsent) {
        this.consentStatus = changes.telemetryConsent.newValue === true;
        if (!this.consentStatus) {
          this.stopCollection();
        }
      }
    });

    // Track feature usage (only with consent)
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      if (request.type === 'feature_used' && this.consentStatus) {
        this.trackFeature(request.feature);
      }
    });
  }

  trackFeature(featureName) {
    if (!this.consentStatus) return;
    
    this.metrics.features[featureName] = (this.metrics.features[featureName] || 0) + 1;
    
    this.track('feature_used', {
      feature: featureName,
      timestamp: Date.now()
    });
  }

  trackPerformance(operation, duration) {
    if (!this.consentStatus) return;
    
    if (!this.metrics.performance[operation]) {
      this.metrics.performance[operation] = {
        count: 0,
        totalDuration: 0,
        avgDuration: 0,
        minDuration: duration,
        maxDuration: duration
      };
    }
    
    const perf = this.metrics.performance[operation];
    perf.count++;
    perf.totalDuration += duration;
    perf.avgDuration = perf.totalDuration / perf.count;
    perf.minDuration = Math.min(perf.minDuration, duration);
    perf.maxDuration = Math.max(perf.maxDuration, duration);
  }

  track(eventName, data = {}) {
    if (!this.consentStatus) return;
    
    const event = {
      name: eventName,
      timestamp: Date.now(),
      sessionId: this.getSessionId(),
      ...data
    };
    
    // Send to backend
    this.sendMetric(event);
  }

  async sendMetric(metric) {
    if (!this.consentStatus) return;
    
    try {
      await fetch(this.metricsEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Extension-Version': chrome.runtime.getManifest().version
        },
        body: JSON.stringify({
          metric,
          metadata: {
            consentGiven: true,
            environment: 'production'
          }
        })
      });
    } catch (e) {
      // Fail silently
      console.debug('[Semantest] Metrics send failed:', e);
    }
  }

  stopCollection() {
    // Clear all collected data when consent is revoked
    this.metrics = {
      sessions: 0,
      features: {},
      performance: {},
      errors: 0
    };
    console.log('[Semantest] Metrics collection stopped - data cleared');
  }

  getSessionId() {
    if (!this.sessionId) {
      this.sessionId = 'anon_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }
    return this.sessionId;
  }

  // Privacy-preserving aggregated metrics
  getAggregatedMetrics() {
    if (!this.consentStatus) {
      return { message: 'Metrics disabled - no consent' };
    }
    
    return {
      totalSessions: this.metrics.sessions,
      popularFeatures: Object.entries(this.metrics.features)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5)
        .map(([feature, count]) => ({ feature, count })),
      performanceSummary: Object.entries(this.metrics.performance)
        .map(([op, data]) => ({
          operation: op,
          avgDuration: Math.round(data.avgDuration),
          count: data.count
        }))
    };
  }
}

// Initialize
const userMetrics = new UserMetrics();
userMetrics.initialize();