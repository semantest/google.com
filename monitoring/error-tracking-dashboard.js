/**
 * Production Error Tracking Dashboard
 * Respects user consent for telemetry
 */

class ErrorTrackingDashboard {
  constructor() {
    this.errors = [];
    this.sessionId = this.generateSessionId();
    this.consentStatus = null;
    this.dashboardUrl = 'https://monitoring.semantest.com/errors';
  }

  async initialize() {
    // Check user consent first
    this.consentStatus = await this.checkUserConsent();
    
    if (this.consentStatus) {
      this.setupErrorHandlers();
      this.setupReporting();
      console.log('[Semantest] Error tracking initialized');
    } else {
      console.log('[Semantest] Error tracking disabled - no consent');
    }
  }

  async checkUserConsent() {
    return new Promise((resolve) => {
      chrome.storage.local.get(['telemetryConsent'], (result) => {
        resolve(result.telemetryConsent === true);
      });
    });
  }

  setupErrorHandlers() {
    // Global error handler
    window.addEventListener('error', (event) => {
      this.captureError({
        type: 'javascript',
        message: event.message,
        source: event.filename,
        line: event.lineno,
        column: event.colno,
        stack: event.error?.stack,
        timestamp: new Date().toISOString()
      });
    });

    // Promise rejection handler
    window.addEventListener('unhandledrejection', (event) => {
      this.captureError({
        type: 'promise_rejection',
        message: event.reason?.message || event.reason,
        stack: event.reason?.stack,
        timestamp: new Date().toISOString()
      });
    });

    // Chrome API errors
    if (chrome.runtime) {
      chrome.runtime.onError?.addListener((error) => {
        this.captureError({
          type: 'chrome_api',
          message: error,
          timestamp: new Date().toISOString()
        });
      });
    }
  }

  captureError(errorData) {
    if (!this.consentStatus) return;

    const error = {
      ...errorData,
      sessionId: this.sessionId,
      version: chrome.runtime.getManifest().version,
      userAgent: navigator.userAgent,
      url: window.location.href,
      extensionId: chrome.runtime.id
    };

    // Remove any PII
    error.message = this.sanitizeMessage(error.message);
    
    this.errors.push(error);
    this.sendToBackend(error);
  }

  sanitizeMessage(message) {
    if (!message) return '';
    // Remove potential email addresses
    message = message.replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, '[email]');
    // Remove potential paths with usernames
    message = message.replace(/\/Users\/[^\/]+/g, '/Users/[user]');
    message = message.replace(/\/home\/[^\/]+/g, '/home/[user]');
    return message;
  }

  async sendToBackend(error) {
    if (!this.consentStatus) return;

    try {
      await fetch(this.dashboardUrl + '/api/errors', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Extension-Version': chrome.runtime.getManifest().version
        },
        body: JSON.stringify({
          error,
          metadata: {
            timestamp: Date.now(),
            environment: 'production'
          }
        })
      });
    } catch (e) {
      // Silently fail - don't create error loop
      console.error('[Semantest] Failed to send error report:', e);
    }
  }

  generateSessionId() {
    return 'sess_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  // Dashboard aggregation methods
  getErrorSummary() {
    const summary = {
      total: this.errors.length,
      byType: {},
      bySource: {},
      recent: this.errors.slice(-10)
    };

    this.errors.forEach(error => {
      summary.byType[error.type] = (summary.byType[error.type] || 0) + 1;
      if (error.source) {
        summary.bySource[error.source] = (summary.bySource[error.source] || 0) + 1;
      }
    });

    return summary;
  }

  clearErrors() {
    this.errors = [];
  }
}

// Initialize on load
const errorDashboard = new ErrorTrackingDashboard();
errorDashboard.initialize();