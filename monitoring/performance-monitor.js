/**
 * Performance Monitoring System
 * Tracks extension performance metrics
 */

class PerformanceMonitor {
  constructor() {
    this.metrics = {
      loadTime: {},
      apiCalls: {},
      memoryUsage: {},
      operations: {}
    };
    this.thresholds = {
      loadTime: 3000, // 3 seconds
      apiCall: 1000,  // 1 second
      memory: 50 * 1024 * 1024 // 50MB
    };
  }

  initialize() {
    this.measureExtensionLoad();
    this.setupPerformanceObservers();
    this.monitorMemoryUsage();
    this.setupAPIMonitoring();
    console.log('[Semantest] Performance monitoring initialized');
  }

  measureExtensionLoad() {
    // Measure extension startup time
    const loadStart = performance.timing.fetchStart;
    const loadEnd = performance.timing.loadEventEnd;
    const loadTime = loadEnd - loadStart;

    this.metrics.loadTime = {
      duration: loadTime,
      timestamp: new Date().toISOString(),
      status: loadTime < this.thresholds.loadTime ? 'healthy' : 'slow'
    };

    if (loadTime > this.thresholds.loadTime) {
      this.triggerAlert('slow_load', {
        duration: loadTime,
        threshold: this.thresholds.loadTime
      });
    }
  }

  setupPerformanceObservers() {
    if ('PerformanceObserver' in window) {
      // Observe long tasks
      const longTaskObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.duration > 50) { // Tasks longer than 50ms
            this.recordLongTask(entry);
          }
        }
      });
      
      try {
        longTaskObserver.observe({ entryTypes: ['longtask'] });
      } catch (e) {
        console.debug('[Semantest] Long task observer not supported');
      }

      // Observe resource timing
      const resourceObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          this.recordResourceTiming(entry);
        }
      });
      
      resourceObserver.observe({ entryTypes: ['resource'] });
    }
  }

  monitorMemoryUsage() {
    if (performance.memory) {
      setInterval(() => {
        const memory = {
          used: performance.memory.usedJSHeapSize,
          total: performance.memory.totalJSHeapSize,
          limit: performance.memory.jsHeapSizeLimit,
          timestamp: Date.now()
        };

        this.metrics.memoryUsage = memory;

        // Alert if memory usage is high
        if (memory.used > this.thresholds.memory) {
          this.triggerAlert('high_memory', {
            used: memory.used,
            threshold: this.thresholds.memory
          });
        }
      }, 30000); // Check every 30 seconds
    }
  }

  setupAPIMonitoring() {
    // Monitor Chrome API calls
    const apis = ['storage', 'tabs', 'runtime'];
    
    apis.forEach(api => {
      if (chrome[api]) {
        this.wrapAPI(api);
      }
    });
  }

  wrapAPI(apiName) {
    const original = chrome[apiName];
    const monitor = this;

    // Wrap common methods
    ['get', 'set', 'query', 'sendMessage'].forEach(method => {
      if (original[method]) {
        const originalMethod = original[method];
        
        chrome[apiName][method] = function(...args) {
          const start = performance.now();
          const callback = args[args.length - 1];
          
          if (typeof callback === 'function') {
            args[args.length - 1] = function(...callbackArgs) {
              const duration = performance.now() - start;
              monitor.recordAPICall(apiName, method, duration);
              callback.apply(this, callbackArgs);
            };
          }
          
          return originalMethod.apply(this, args);
        };
      }
    });
  }

  recordAPICall(api, method, duration) {
    const key = `${api}.${method}`;
    
    if (!this.metrics.apiCalls[key]) {
      this.metrics.apiCalls[key] = {
        count: 0,
        totalDuration: 0,
        avgDuration: 0,
        maxDuration: 0
      };
    }
    
    const metric = this.metrics.apiCalls[key];
    metric.count++;
    metric.totalDuration += duration;
    metric.avgDuration = metric.totalDuration / metric.count;
    metric.maxDuration = Math.max(metric.maxDuration, duration);

    if (duration > this.thresholds.apiCall) {
      this.triggerAlert('slow_api_call', {
        api: key,
        duration,
        threshold: this.thresholds.apiCall
      });
    }
  }

  recordLongTask(entry) {
    const task = {
      duration: entry.duration,
      startTime: entry.startTime,
      timestamp: Date.now()
    };

    if (!this.metrics.operations.longTasks) {
      this.metrics.operations.longTasks = [];
    }
    
    this.metrics.operations.longTasks.push(task);
    
    // Keep only last 100 long tasks
    if (this.metrics.operations.longTasks.length > 100) {
      this.metrics.operations.longTasks.shift();
    }
  }

  recordResourceTiming(entry) {
    if (entry.initiatorType === 'fetch' || entry.initiatorType === 'xmlhttprequest') {
      const timing = {
        url: entry.name,
        duration: entry.duration,
        size: entry.transferSize,
        timestamp: Date.now()
      };

      if (!this.metrics.operations.networkRequests) {
        this.metrics.operations.networkRequests = [];
      }
      
      this.metrics.operations.networkRequests.push(timing);
      
      // Keep only last 100 requests
      if (this.metrics.operations.networkRequests.length > 100) {
        this.metrics.operations.networkRequests.shift();
      }
    }
  }

  measureOperation(operationName, fn) {
    const start = performance.now();
    
    try {
      const result = fn();
      const duration = performance.now() - start;
      
      this.recordOperation(operationName, duration, 'success');
      
      return result;
    } catch (error) {
      const duration = performance.now() - start;
      
      this.recordOperation(operationName, duration, 'error');
      
      throw error;
    }
  }

  async measureAsyncOperation(operationName, fn) {
    const start = performance.now();
    
    try {
      const result = await fn();
      const duration = performance.now() - start;
      
      this.recordOperation(operationName, duration, 'success');
      
      return result;
    } catch (error) {
      const duration = performance.now() - start;
      
      this.recordOperation(operationName, duration, 'error');
      
      throw error;
    }
  }

  recordOperation(name, duration, status) {
    if (!this.metrics.operations[name]) {
      this.metrics.operations[name] = {
        count: 0,
        successCount: 0,
        errorCount: 0,
        totalDuration: 0,
        avgDuration: 0,
        maxDuration: 0
      };
    }
    
    const op = this.metrics.operations[name];
    op.count++;
    op[status + 'Count']++;
    op.totalDuration += duration;
    op.avgDuration = op.totalDuration / op.count;
    op.maxDuration = Math.max(op.maxDuration, duration);
  }

  triggerAlert(type, data) {
    // Send to monitoring backend
    this.sendAlert({
      type,
      data,
      timestamp: Date.now(),
      version: chrome.runtime.getManifest().version
    });
  }

  async sendAlert(alert) {
    try {
      await fetch('https://monitoring.semantest.com/alerts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(alert)
      });
    } catch (e) {
      console.error('[Semantest] Failed to send alert:', e);
    }
  }

  getPerformanceSummary() {
    return {
      loadTime: this.metrics.loadTime,
      memory: {
        current: this.metrics.memoryUsage.used,
        percentage: (this.metrics.memoryUsage.used / this.metrics.memoryUsage.limit) * 100
      },
      apiCalls: Object.entries(this.metrics.apiCalls)
        .map(([api, data]) => ({
          api,
          avgDuration: Math.round(data.avgDuration),
          callCount: data.count
        }))
        .sort((a, b) => b.callCount - a.callCount)
        .slice(0, 10),
      operations: Object.entries(this.metrics.operations)
        .filter(([key]) => key !== 'longTasks' && key !== 'networkRequests')
        .map(([op, data]) => ({
          operation: op,
          avgDuration: Math.round(data.avgDuration),
          successRate: (data.successCount / data.count) * 100
        }))
    };
  }
}

// Initialize performance monitoring
const performanceMonitor = new PerformanceMonitor();
performanceMonitor.initialize();

// Export for use in other modules
window.semantestPerformance = performanceMonitor;