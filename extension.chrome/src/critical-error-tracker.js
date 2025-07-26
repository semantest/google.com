/**
 * CRITICAL: Error Tracker for ChatGPT Extension Beta Launch
 * Must be loaded FIRST in all extension contexts
 */

class CriticalErrorTracker {
    constructor() {
        this.endpoint = 'http://localhost:3001/errors';
        this.userId = this.getUserId();
        this.sessionId = this.generateSessionId();
        this.version = '1.0.0-beta';
        this.errorQueue = [];
        this.isOnline = navigator.onLine;
        
        console.log('🚨 Critical Error Tracker initialized for user:', this.userId);
        this.initialize();
    }

    initialize() {
        // Set up global error handlers IMMEDIATELY
        this.setupGlobalHandlers();
        
        // Set up Chrome extension specific handlers
        this.setupChromeHandlers();
        
        // Monitor online status
        this.setupNetworkHandlers();
        
        // Process any queued errors
        this.processQueue();
        
        // Track initialization
        this.trackEvent('error_tracker_initialized');
    }

    setupGlobalHandlers() {
        // Uncaught JavaScript errors
        window.addEventListener('error', (event) => {
            this.captureError({
                type: 'javascript_error',
                message: event.message,
                source: event.filename,
                line: event.lineno,
                column: event.colno,
                stack: event.error?.stack,
                severity: 'high'
            });
        });

        // Unhandled promise rejections
        window.addEventListener('unhandledrejection', (event) => {
            this.captureError({
                type: 'unhandled_promise_rejection',
                message: event.reason?.message || String(event.reason),
                stack: event.reason?.stack,
                severity: 'medium'
            });
        });

        // Security policy violations
        document.addEventListener('securitypolicyviolation', (event) => {
            this.captureError({
                type: 'csp_violation',
                message: `CSP violation: ${event.violatedDirective}`,
                blockedURI: event.blockedURI,
                severity: 'high'
            });
        });
    }

    setupChromeHandlers() {
        if (typeof chrome === 'undefined' || !chrome.runtime) return;

        // Chrome runtime errors
        if (chrome.runtime.onInstalled) {
            chrome.runtime.onInstalled.addListener(() => {
                this.trackEvent('extension_installed');
            });
        }

        // Chrome API errors - check after each API call
        const originalAPI = chrome.runtime.lastError;
        
        // Monitor chrome.runtime.lastError
        setInterval(() => {
            if (chrome.runtime.lastError) {
                this.captureError({
                    type: 'chrome_api_error',
                    message: chrome.runtime.lastError.message,
                    api: 'runtime',
                    severity: 'high'
                });
            }
        }, 1000);

        // Monitor tab access errors
        if (chrome.tabs) {
            const originalQuery = chrome.tabs.query;
            chrome.tabs.query = function(...args) {
                const result = originalQuery.apply(this, args);
                if (chrome.runtime.lastError) {
                    window.errorTracker?.captureError({
                        type: 'chrome_tabs_error',
                        message: chrome.runtime.lastError.message,
                        api: 'tabs.query',
                        severity: 'medium'
                    });
                }
                return result;
            };
        }
    }

    setupNetworkHandlers() {
        window.addEventListener('online', () => {
            this.isOnline = true;
            this.processQueue();
        });

        window.addEventListener('offline', () => {
            this.isOnline = false;
        });
    }

    captureError(errorData) {
        const enrichedError = {
            ...errorData,
            timestamp: new Date().toISOString(),
            userId: this.userId,
            sessionId: this.sessionId,
            version: this.version,
            context: {
                url: window.location?.href || 'extension-context',
                userAgent: navigator.userAgent,
                platform: navigator.platform,
                language: navigator.language,
                cookieEnabled: navigator.cookieEnabled,
                onLine: navigator.onLine,
                memory: this.getMemoryInfo(),
                viewport: this.getViewportInfo()
            }
        };

        // Log immediately to console for debugging
        console.error('🚨 EXTENSION ERROR CAPTURED:', enrichedError);

        // Add to queue
        this.errorQueue.push(enrichedError);

        // Try to send immediately if online
        if (this.isOnline) {
            this.processQueue();
        }

        // Store in localStorage as backup
        this.storeErrorLocally(enrichedError);
    }

    async processQueue() {
        if (!this.isOnline || this.errorQueue.length === 0) return;

        const errorsToSend = [...this.errorQueue];
        this.errorQueue = [];

        try {
            const response = await fetch(this.endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    errors: errorsToSend,
                    batch: true,
                    metadata: {
                        totalErrors: errorsToSend.length,
                        sessionId: this.sessionId,
                        timestamp: new Date().toISOString()
                    }
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            console.log(`✅ Sent ${errorsToSend.length} errors to tracking server`);
            
            // Clear local storage on successful send
            this.clearLocalErrors();
            
        } catch (error) {
            console.warn('❌ Failed to send errors, re-queuing:', error.message);
            // Put errors back in queue
            this.errorQueue.unshift(...errorsToSend);
            
            // Limit queue size to prevent memory issues
            if (this.errorQueue.length > 50) {
                this.errorQueue = this.errorQueue.slice(0, 50);
            }
        }
    }

    trackEvent(eventName, data = {}) {
        // Track non-error events for context
        const event = {
            type: 'event',
            name: eventName,
            timestamp: new Date().toISOString(),
            userId: this.userId,
            sessionId: this.sessionId,
            version: this.version,
            data: data
        };

        if (this.isOnline) {
            fetch(this.endpoint.replace('/errors', '/events'), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(event)
            }).catch(() => {}); // Silent fail for events
        }
    }

    // Helper methods
    getUserId() {
        let userId = localStorage.getItem('critical_error_tracker_user_id');
        if (!userId) {
            userId = `beta_user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            localStorage.setItem('critical_error_tracker_user_id', userId);
        }
        return userId;
    }

    generateSessionId() {
        return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    getMemoryInfo() {
        if (performance.memory) {
            return {
                used: Math.round(performance.memory.usedJSHeapSize / 1048576), // MB
                total: Math.round(performance.memory.totalJSHeapSize / 1048576), // MB
                limit: Math.round(performance.memory.jsHeapSizeLimit / 1048576) // MB
            };
        }
        return null;
    }

    getViewportInfo() {
        return {
            width: window.innerWidth,
            height: window.innerHeight,
            ratio: window.devicePixelRatio
        };
    }

    storeErrorLocally(error) {
        try {
            const stored = JSON.parse(localStorage.getItem('critical_errors') || '[]');
            stored.push(error);
            
            // Keep only last 20 errors
            const recent = stored.slice(-20);
            localStorage.setItem('critical_errors', JSON.stringify(recent));
        } catch (e) {
            console.warn('Failed to store error locally:', e);
        }
    }

    clearLocalErrors() {
        try {
            localStorage.removeItem('critical_errors');
        } catch (e) {
            console.warn('Failed to clear local errors:', e);
        }
    }

    // Public API for manual error reporting
    reportError(error, context = {}) {
        this.captureError({
            type: 'manual_report',
            message: error.message || String(error),
            stack: error.stack,
            severity: context.severity || 'medium',
            ...context
        });
    }

    reportChromeAPIError(api, error, details = {}) {
        this.captureError({
            type: 'chrome_api_error',
            api: api,
            message: error.message || String(error),
            stack: error.stack,
            severity: 'high',
            ...details
        });
    }

    reportFeatureError(feature, error, userAction = '') {
        this.captureError({
            type: 'feature_error',
            feature: feature,
            userAction: userAction,
            message: error.message || String(error),
            stack: error.stack,
            severity: 'high'
        });
    }
}

// Initialize IMMEDIATELY
window.errorTracker = new CriticalErrorTracker();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CriticalErrorTracker;
}