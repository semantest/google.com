/**
 * Enhanced Consent System Monitor for v1.0.1
 * Tracks telemetryConsentPending, retry logic, and 30-second intervals
 */

class EnhancedConsentMonitor {
  constructor() {
    this.metrics = {
      consentPending: 0,
      retryAttempts: [],
      intervalChecks: [],
      consentSuccess: 0,
      consentFailures: 0,
      averageRetries: 0,
      maxRetries: 0
    };
    
    this.alerts = {
      maxRetriesExceeded: 5,
      consentFailureRate: 0.1, // 10%
      pendingTimeout: 300000 // 5 minutes
    };
  }

  initialize() {
    console.log('[v1.0.1] Enhanced consent monitoring initialized');
    
    // Monitor storage for telemetryConsentPending
    this.monitorConsentPending();
    
    // Track retry attempts in console
    this.setupLogMonitoring();
    
    // Monitor 30-second interval checks
    this.trackIntervalChecks();
    
    // Set up failure alerts
    this.configureAlerts();
  }

  monitorConsentPending() {
    // Check storage for pending flag
    chrome.storage.local.onChanged.addListener((changes, area) => {
      if (area === 'local' && changes.telemetryConsentPending) {
        const pending = changes.telemetryConsentPending;
        
        if (pending.newValue === true) {
          this.metrics.consentPending++;
          console.log('[Monitor] Consent pending flag SET - waiting for user response');
          
          // Start tracking how long it stays pending
          this.trackPendingDuration();
          
          // Send metric
          this.sendMetric('consent_pending_set', {
            timestamp: Date.now(),
            version: '1.0.1'
          });
        } else if (pending.oldValue === true && !pending.newValue) {
          console.log('[Monitor] Consent pending flag CLEARED - user responded');
          
          // Check final consent status
          chrome.storage.local.get(['telemetryConsent'], (result) => {
            if (result.telemetryConsent === true) {
              this.metrics.consentSuccess++;
              this.sendMetric('consent_accepted_after_pending', {
                retries: this.getCurrentRetryCount()
              });
            } else {
              this.sendMetric('consent_declined_after_pending', {});
            }
          });
        }
      }
    });
  }

  setupLogMonitoring() {
    // Override console.log to capture retry attempts
    const originalLog = console.log;
    console.log = (...args) => {
      const message = args.join(' ');
      
      // Detect retry attempts
      if (message.includes('Retry attempt') || message.includes('consent retry')) {
        const retryMatch = message.match(/attempt[^\d]*(\d+)/i);
        if (retryMatch) {
          const attemptNumber = parseInt(retryMatch[1]);
          this.trackRetryAttempt(attemptNumber);
        }
      }
      
      // Detect 30-second checks
      if (message.includes('30 second') || message.includes('interval check')) {
        this.metrics.intervalChecks.push({
          timestamp: Date.now(),
          message: message
        });
      }
      
      // Detect consent failures
      if (message.includes('consent failed') || message.includes('consent error')) {
        this.handleConsentFailure(message);
      }
      
      originalLog.apply(console, args);
    };
  }

  trackRetryAttempt(attemptNumber) {
    this.metrics.retryAttempts.push({
      attempt: attemptNumber,
      timestamp: Date.now()
    });
    
    // Update max retries
    this.metrics.maxRetries = Math.max(this.metrics.maxRetries, attemptNumber);
    
    // Calculate average
    const total = this.metrics.retryAttempts.reduce((sum, r) => sum + r.attempt, 0);
    this.metrics.averageRetries = total / this.metrics.retryAttempts.length;
    
    console.log(`[Monitor] Retry attempt ${attemptNumber} tracked`);
    
    // Alert if too many retries
    if (attemptNumber > this.alerts.maxRetriesExceeded) {
      this.triggerAlert('excessive_retries', {
        attempts: attemptNumber,
        threshold: this.alerts.maxRetriesExceeded
      });
    }
    
    // Send metric
    this.sendMetric('consent_retry_attempt', {
      attempt: attemptNumber,
      timestamp: Date.now()
    });
  }

  trackIntervalChecks() {
    // Monitor for 30-second interval pattern
    let lastCheckTime = null;
    
    setInterval(() => {
      // Check if consent is still pending
      chrome.storage.local.get(['telemetryConsentPending'], (result) => {
        if (result.telemetryConsentPending === true) {
          const now = Date.now();
          
          if (lastCheckTime) {
            const interval = now - lastCheckTime;
            
            // Verify ~30 second interval (allow 25-35 seconds)
            if (interval >= 25000 && interval <= 35000) {
              console.log('[Monitor] 30-second interval check confirmed');
              this.sendMetric('consent_interval_check', {
                interval: interval,
                status: 'on_schedule'
              });
            } else {
              console.warn(`[Monitor] Interval check off schedule: ${interval}ms`);
              this.sendMetric('consent_interval_check', {
                interval: interval,
                status: 'off_schedule'
              });
            }
          }
          
          lastCheckTime = now;
        }
      });
    }, 5000); // Check every 5 seconds
  }

  trackPendingDuration() {
    const startTime = Date.now();
    
    const checkDuration = setInterval(() => {
      chrome.storage.local.get(['telemetryConsentPending'], (result) => {
        if (result.telemetryConsentPending !== true) {
          // Pending cleared
          clearInterval(checkDuration);
          const duration = Date.now() - startTime;
          
          this.sendMetric('consent_pending_duration', {
            duration: duration,
            resolved: true
          });
        } else {
          // Still pending
          const duration = Date.now() - startTime;
          
          if (duration > this.alerts.pendingTimeout) {
            this.triggerAlert('consent_pending_timeout', {
              duration: duration,
              threshold: this.alerts.pendingTimeout
            });
            clearInterval(checkDuration);
          }
        }
      });
    }, 10000); // Check every 10 seconds
  }

  handleConsentFailure(errorMessage) {
    this.metrics.consentFailures++;
    
    const failureRate = this.metrics.consentFailures / 
      (this.metrics.consentSuccess + this.metrics.consentFailures);
    
    console.error('[Monitor] Consent failure detected:', errorMessage);
    
    // Send immediate alert
    this.triggerAlert('consent_failure', {
      error: errorMessage,
      failureCount: this.metrics.consentFailures,
      failureRate: failureRate
    });
    
    // Check failure rate threshold
    if (failureRate > this.alerts.consentFailureRate) {
      this.triggerAlert('high_consent_failure_rate', {
        rate: failureRate,
        threshold: this.alerts.consentFailureRate
      });
    }
  }

  configureAlerts() {
    // Set up alert rules for consent system
    const alertRules = [
      {
        name: 'consent_stuck_pending',
        condition: () => this.isPendingTooLong(),
        message: 'Consent popup stuck in pending state',
        severity: 'high'
      },
      {
        name: 'retry_loop_detected',
        condition: () => this.metrics.maxRetries > 10,
        message: 'Excessive consent retry attempts detected',
        severity: 'critical'
      },
      {
        name: 'interval_checks_stopped',
        condition: () => this.intervalChecksStopped(),
        message: '30-second interval checks have stopped',
        severity: 'warning'
      },
      {
        name: 'consent_system_failure',
        condition: () => this.metrics.consentFailures > 5,
        message: 'Multiple consent system failures',
        severity: 'critical'
      }
    ];
    
    // Check alerts every minute
    setInterval(() => {
      alertRules.forEach(rule => {
        if (rule.condition()) {
          this.triggerAlert(rule.name, {
            message: rule.message,
            severity: rule.severity
          });
        }
      });
    }, 60000);
  }

  isPendingTooLong() {
    // Check if any pending flag has been set for too long
    const oldestPending = this.metrics.consentPending;
    return oldestPending > 0 && Date.now() - oldestPending > this.alerts.pendingTimeout;
  }

  intervalChecksStopped() {
    if (this.metrics.intervalChecks.length === 0) return false;
    
    const lastCheck = this.metrics.intervalChecks[this.metrics.intervalChecks.length - 1];
    const timeSinceLastCheck = Date.now() - lastCheck.timestamp;
    
    // Alert if no check in last 2 minutes
    return timeSinceLastCheck > 120000;
  }

  getCurrentRetryCount() {
    if (this.metrics.retryAttempts.length === 0) return 0;
    return this.metrics.retryAttempts[this.metrics.retryAttempts.length - 1].attempt;
  }

  async sendMetric(name, data) {
    try {
      await fetch('https://monitoring.semantest.com/metrics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          metric: {
            name: `consent_enhanced_${name}`,
            ...data,
            version: '1.0.1',
            timestamp: Date.now()
          }
        })
      });
    } catch (e) {
      console.debug('[Monitor] Metric send failed:', e);
    }
  }

  async triggerAlert(type, data) {
    console.warn(`[ALERT] ${type}:`, data);
    
    try {
      await fetch('https://monitoring.semantest.com/alerts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Alert-Priority': data.severity || 'high'
        },
        body: JSON.stringify({
          type: `consent_${type}`,
          ...data,
          version: '1.0.1',
          timestamp: Date.now()
        })
      });
    } catch (e) {
      console.error('[Monitor] Alert send failed:', e);
    }
  }

  getMetricsSummary() {
    return {
      pendingCount: this.metrics.consentPending,
      retryAttempts: this.metrics.retryAttempts.length,
      maxRetries: this.metrics.maxRetries,
      avgRetries: Math.round(this.metrics.averageRetries),
      intervalChecks: this.metrics.intervalChecks.length,
      successRate: this.metrics.consentSuccess > 0 
        ? Math.round((this.metrics.consentSuccess / (this.metrics.consentSuccess + this.metrics.consentFailures)) * 100)
        : 0,
      failures: this.metrics.consentFailures,
      status: this.metrics.consentFailures > 0 ? '⚠️ ISSUES' : '✅ HEALTHY'
    };
  }
}

// Initialize enhanced monitoring
const enhancedConsentMonitor = new EnhancedConsentMonitor();
enhancedConsentMonitor.initialize();

// Export for dashboard
window.semantestEnhancedConsent = enhancedConsentMonitor;