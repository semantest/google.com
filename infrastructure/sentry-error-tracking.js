/**
 * Sentry Error Tracking Integration
 * Production-ready error monitoring for ChatGPT Extension
 */

import * as Sentry from "@sentry/browser";
import { Integrations } from "@sentry/tracing";

class ErrorTrackingService {
  constructor() {
    this.initialized = false;
    this.environment = this.getEnvironment();
    this.version = this.getVersion();
  }

  /**
   * Initialize Sentry for extension error tracking
   */
  initialize() {
    if (this.initialized) return;

    Sentry.init({
      dsn: "https://your-dsn@sentry.io/project-id",
      environment: this.environment,
      release: `chatgpt-extension@${this.version}`,
      
      // Configure sampling rates
      tracesSampleRate: this.environment === 'production' ? 0.1 : 1.0,
      
      // Chrome extension specific configuration
      integrations: [
        new Integrations.BrowserTracing({
          // Set up automatic route change tracking
          routingInstrumentation: Sentry.browserTracingIntegration(),
        }),
      ],

      // Filter out noise and sensitive data
      beforeSend(event, hint) {
        // Don't send events from chrome-extension:// URLs in production
        if (event.request?.url?.startsWith('chrome-extension://') && 
            this.environment === 'production') {
          return null;
        }

        // Filter out known non-critical errors
        if (this.isKnownNonCriticalError(event)) {
          return null;
        }

        // Sanitize sensitive data
        return this.sanitizeEvent(event);
      },

      // Set user context
      initialScope: {
        tags: {
          component: "chrome-extension",
          platform: navigator.platform
        },
        user: {
          id: this.getUserId(),
          segment: "beta-user"
        },
        contexts: {
          browser: {
            name: this.getBrowserInfo().name,
            version: this.getBrowserInfo().version
          },
          extension: {
            version: this.version,
            manifest_version: 3
          }
        }
      }
    });

    // Set up additional context
    this.setupContext();
    this.setupPerformanceMonitoring();
    this.initialized = true;

    console.log(`✅ Sentry initialized for ${this.environment} environment`);
  }

  /**
   * Report extension-specific errors
   */
  reportError(error, context = {}) {
    if (!this.initialized) {
      console.warn('Sentry not initialized, queuing error');
      return;
    }

    Sentry.withScope((scope) => {
      // Add extension-specific context
      scope.setTag('error_source', 'extension');
      scope.setLevel('error');
      
      // Add custom context
      Object.keys(context).forEach(key => {
        scope.setContext(key, context[key]);
      });

      // Capture the error
      Sentry.captureException(error);
    });
  }

  /**
   * Report Chrome extension API errors
   */
  reportChromeAPIError(api, error, details = {}) {
    Sentry.withScope((scope) => {
      scope.setTag('error_type', 'chrome_api');
      scope.setTag('chrome_api', api);
      scope.setContext('chrome_api_details', {
        api: api,
        lastError: chrome.runtime.lastError?.message,
        ...details
      });

      Sentry.captureException(new Error(`Chrome API Error: ${api} - ${error}`));
    });
  }

  /**
   * Report content script injection errors
   */
  reportContentScriptError(url, error) {
    Sentry.withScope((scope) => {
      scope.setTag('error_type', 'content_script');
      scope.setContext('injection_context', {
        url: url,
        timestamp: Date.now()
      });

      Sentry.captureException(error);
    });
  }

  /**
   * Report permission errors
   */
  reportPermissionError(permission, context = {}) {
    Sentry.withScope((scope) => {
      scope.setTag('error_type', 'permission');
      scope.setTag('permission', permission);
      scope.setContext('permission_context', context);

      Sentry.captureMessage(
        `Permission denied: ${permission}`,
        'warning'
      );
    });
  }

  /**
   * Set up additional Sentry context
   */
  setupContext() {
    // Extension installation details
    chrome.management.getSelf((info) => {
      Sentry.setContext('extension_info', {
        id: info.id,
        name: info.name,
        version: info.version,
        enabled: info.enabled,
        installType: info.installType
      });
    });

    // Browser and system info
    Sentry.setContext('system_info', {
      userAgent: navigator.userAgent,
      language: navigator.language,
      platform: navigator.platform,
      cookieEnabled: navigator.cookieEnabled,
      onLine: navigator.onLine
    });
  }

  /**
   * Set up performance monitoring
   */
  setupPerformanceMonitoring() {
    // Monitor extension startup time
    const startupTransaction = Sentry.startTransaction({
      name: "Extension Startup",
      op: "navigation"
    });

    chrome.runtime.onStartup.addListener(() => {
      startupTransaction.finish();
    });

    // Monitor content script injection performance
    this.monitorContentScriptPerformance();
  }

  /**
   * Monitor content script injection performance
   */
  monitorContentScriptPerformance() {
    const originalExecuteScript = chrome.scripting?.executeScript;
    if (!originalExecuteScript) return;

    chrome.scripting.executeScript = function(...args) {
      const transaction = Sentry.startTransaction({
        name: "Content Script Injection",
        op: "script.injection"
      });

      const startTime = performance.now();
      
      return originalExecuteScript.apply(this, args)
        .then(result => {
          const duration = performance.now() - startTime;
          transaction.setMeasurement("injection_duration", duration, "millisecond");
          transaction.setStatus("ok");
          transaction.finish();
          return result;
        })
        .catch(error => {
          transaction.setStatus("internal_error");
          transaction.finish();
          throw error;
        });
    };
  }

  /**
   * Helper methods
   */
  getEnvironment() {
    const manifest = chrome.runtime.getManifest();
    return manifest.version.includes('beta') ? 'beta' : 'production';
  }

  getVersion() {
    return chrome.runtime.getManifest().version;
  }

  getUserId() {
    // Get or create anonymous user ID
    return new Promise((resolve) => {
      chrome.storage.local.get(['userId'], (result) => {
        if (result.userId) {
          resolve(result.userId);
        } else {
          const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
          chrome.storage.local.set({ userId });
          resolve(userId);
        }
      });
    });
  }

  getBrowserInfo() {
    const ua = navigator.userAgent;
    const chrome = ua.match(/Chrome\/(\d+)/);
    return {
      name: 'Chrome',
      version: chrome ? chrome[1] : 'unknown'
    };
  }

  isKnownNonCriticalError(event) {
    const message = event.exception?.values?.[0]?.value || '';
    
    // Filter out known non-critical errors
    const nonCriticalPatterns = [
      'Non-Error promise rejection captured',
      'ResizeObserver loop limit exceeded',
      'Failed to fetch',
      'NetworkError when attempting to fetch resource'
    ];

    return nonCriticalPatterns.some(pattern => 
      message.includes(pattern)
    );
  }

  sanitizeEvent(event) {
    // Remove sensitive information
    if (event.request?.headers) {
      delete event.request.headers['Authorization'];
      delete event.request.headers['Cookie'];
    }

    // Sanitize URLs
    if (event.request?.url) {
      event.request.url = event.request.url.replace(/[?&]token=[^&]+/g, '?token=***');
    }

    return event;
  }

  /**
   * Public API for extension components
   */
  static getInstance() {
    if (!ErrorTrackingService.instance) {
      ErrorTrackingService.instance = new ErrorTrackingService();
    }
    return ErrorTrackingService.instance;
  }

  // Convenience methods
  static reportError(error, context) {
    return ErrorTrackingService.getInstance().reportError(error, context);
  }

  static reportChromeAPIError(api, error, details) {
    return ErrorTrackingService.getInstance().reportChromeAPIError(api, error, details);
  }
}

// Auto-initialize in background script
if (typeof chrome !== 'undefined' && chrome.runtime) {
  const errorTracker = ErrorTrackingService.getInstance();
  errorTracker.initialize();

  // Global error handlers
  window.addEventListener('error', (event) => {
    errorTracker.reportError(event.error, {
      source: event.filename,
      line: event.lineno,
      column: event.colno
    });
  });

  window.addEventListener('unhandledrejection', (event) => {
    errorTracker.reportError(event.reason, {
      type: 'unhandled_promise_rejection'
    });
  });
}

export default ErrorTrackingService;