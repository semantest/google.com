/**
 * Consent Popup Tracker for v1.0.1
 * Monitors the FIXED consent popup behavior
 */

class ConsentPopupTracker {
  constructor() {
    this.metrics = {
      displayed: 0,
      accepted: 0,
      declined: 0,
      errors: 0,
      displayTime: [],
      responseTime: []
    };
    this.startTime = null;
  }

  initialize() {
    // Listen for consent popup events from service-worker.js
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      switch(request.type) {
        case 'consent_popup_displayed':
          this.trackPopupDisplayed();
          break;
        case 'consent_popup_accepted':
          this.trackConsentAccepted();
          break;
        case 'consent_popup_declined':
          this.trackConsentDeclined();
          break;
        case 'consent_popup_error':
          this.trackConsentError(request.error);
          break;
      }
    });

    console.log('[v1.0.1] Consent popup tracker initialized');
  }

  trackPopupDisplayed() {
    this.metrics.displayed++;
    this.startTime = performance.now();
    
    // Send to monitoring
    this.sendMetric('consent_popup_displayed', {
      version: '1.0.1',
      timestamp: Date.now()
    });

    console.log('[v1.0.1] Consent popup displayed successfully!');
  }

  trackConsentAccepted() {
    this.metrics.accepted++;
    
    if (this.startTime) {
      const responseTime = performance.now() - this.startTime;
      this.metrics.responseTime.push(responseTime);
    }
    
    // Send success metric
    this.sendMetric('consent_accepted', {
      version: '1.0.1',
      responseTime: this.metrics.responseTime[this.metrics.responseTime.length - 1],
      successRate: this.calculateSuccessRate()
    });

    // Celebrate the fix!
    console.log('🎉 [v1.0.1] User accepted telemetry - consent popup WORKING!');
  }

  trackConsentDeclined() {
    this.metrics.declined++;
    
    if (this.startTime) {
      const responseTime = performance.now() - this.startTime;
      this.metrics.responseTime.push(responseTime);
    }
    
    // Send metric (respecting privacy choice)
    this.sendMetric('consent_declined', {
      version: '1.0.1',
      // No additional data - respecting privacy
    });

    console.log('[v1.0.1] User declined telemetry - privacy respected');
  }

  trackConsentError(error) {
    this.metrics.errors++;
    
    // Alert immediately - this shouldn't happen with the fix!
    this.sendAlert('consent_popup_error', {
      version: '1.0.1',
      error: error.message || error,
      severity: 'critical'
    });

    console.error('[v1.0.1] Consent popup error:', error);
  }

  calculateSuccessRate() {
    const total = this.metrics.accepted + this.metrics.declined;
    if (total === 0) return 0;
    return Math.round((this.metrics.accepted / total) * 100);
  }

  async sendMetric(name, data) {
    try {
      await fetch('https://monitoring.semantest.com/metrics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          metric: { name, ...data },
          metadata: { 
            environment: 'production',
            fixVersion: '1.0.1',
            fixedIn: ['chatgpt-controller.js', 'service-worker.js']
          }
        })
      });
    } catch (e) {
      console.debug('[v1.0.1] Metric send failed:', e);
    }
  }

  async sendAlert(type, data) {
    try {
      await fetch('https://monitoring.semantest.com/alerts', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'X-Alert-Priority': 'high'
        },
        body: JSON.stringify({
          type,
          ...data,
          message: 'Consent popup issue in v1.0.1 (should be fixed!)'
        })
      });
    } catch (e) {
      console.error('[v1.0.1] Alert send failed:', e);
    }
  }

  getMetricsSummary() {
    return {
      displayed: this.metrics.displayed,
      accepted: this.metrics.accepted,
      declined: this.metrics.declined,
      errors: this.metrics.errors,
      successRate: this.calculateSuccessRate(),
      avgResponseTime: this.metrics.responseTime.length > 0 
        ? Math.round(this.metrics.responseTime.reduce((a, b) => a + b, 0) / this.metrics.responseTime.length)
        : 0,
      status: this.metrics.errors === 0 ? '✅ HEALTHY' : '⚠️ ISSUES DETECTED'
    };
  }
}

// Initialize for v1.0.1
const consentTracker = new ConsentPopupTracker();
consentTracker.initialize();

// Export for monitoring dashboard
window.semantestConsentTracker = consentTracker;