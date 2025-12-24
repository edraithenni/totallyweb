class FrontendLogger {
  constructor() {
    this.queue = [];
    this.batchSize = 10;
    this.flushDelay = 3000;
    this.isFlushing = false;
    this.init();
  }

  init() {
    this.setupConsoleIntercept();
    this.setupErrorHandlers();
    this.startFlushTimer();
  }

  setupConsoleIntercept() {
    const methods = ['log', 'error', 'warn', 'info', 'debug', 'trace'];
    const original = {};
    
    methods.forEach(method => {
      original[method] = console[method];
      console[method] = (...args) => {
        this.capture(method, args);
        original[method](...args);
      };
    });
    
    this.originalConsole = original;
  }

  setupErrorHandlers() {
    window.addEventListener('error', (e) => {
      this.capture('error', [
        `Uncaught Error: ${e.message}`,
        `File: ${e.filename}`,
        `Line: ${e.lineno}:${e.colno}`,
        e.error?.stack || ''
      ]);
    });

    window.addEventListener('unhandledrejection', (e) => {
      this.capture('error', [
        'Unhandled Promise Rejection:',
        e.reason?.toString() || 'Unknown reason'
      ]);
    });
  }

  startFlushTimer() {
    setInterval(() => this.flush(), this.flushDelay);
    
    window.addEventListener('beforeunload', () => {
      if (navigator.sendBeacon) {
        const data = new Blob(
          [JSON.stringify({ logs: this.queue })], 
          { type: 'application/json' }
        );
        navigator.sendBeacon('/api/client-logs', data);
      } else {
        this.flushSync();
      }
    });
  }

  capture(level, args) {
    try {
      const message = args.map(arg => 
        typeof arg === 'object' ? JSON.stringify(arg, null, 0) : String(arg)
      ).join(' ');
      
      const entry = {
        timestamp: new Date().toISOString(),
        level: level,
        message: message.substring(0, 1000),
        url: window.location.href,
        userAgent: navigator.userAgent.substring(0, 200),
        path: window.location.pathname
      };
      
      this.queue.push(entry);
      
      if (this.queue.length >= this.batchSize) {
        this.flush();
      }
      
      this.saveToLocalStorage(entry);
    } catch (err) {
      this.originalConsole?.error?.('Logger error:', err);
    }
  }

  saveToLocalStorage(entry) {
    try {
      const key = 'frontend_logs';
      let logs = JSON.parse(localStorage.getItem(key) || '[]');
      logs.push(entry);
      if (logs.length > 100) logs = logs.slice(-100);
      localStorage.setItem(key, JSON.stringify(logs));
    } catch (e) {
      // Ignore storage errors
    }
  }

  async flush() {
    if (this.isFlushing || this.queue.length === 0) return;
    
    this.isFlushing = true;
    const batch = [...this.queue];
    this.queue = [];
    
    try {
      const response = await fetch('/api/client-logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ logs: batch })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      this.originalConsole?.debug?.(`Flushed ${batch.length} logs`);
    } catch (error) {
      this.originalConsole?.error?.('Failed to send logs:', error);
      this.queue.unshift(...batch);
    } finally {
      this.isFlushing = false;
    }
  }

  flushSync() {
    if (this.queue.length === 0) return;
    
    const xhr = new XMLHttpRequest();
    xhr.open('POST', '/api/client-logs', false);
    xhr.setRequestHeader('Content-Type', 'application/json');
    
    try {
      xhr.send(JSON.stringify({ logs: this.queue }));
      this.queue = [];
    } catch (error) {
      this.originalConsole?.error?.('Sync flush failed:', error);
    }
  }

  exportLogs() {
    try {
      const logs = JSON.parse(localStorage.getItem('frontend_logs') || '[]');
      const data = JSON.stringify(logs, null, 2);
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `frontend-logs-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      this.originalConsole?.error?.('Export failed:', error);
    }
  }
}

let loggerInstance = null;

export const initLogger = () => {
  if (typeof window === 'undefined') return null;
  
  if (!loggerInstance) {
    loggerInstance = new FrontendLogger();
    console.log('[Logger] Frontend logging initialized');
    
    window.exportFrontendLogs = () => loggerInstance.exportLogs();
    window.getLogQueueSize = () => loggerInstance.queue.length;
  }
  
  return loggerInstance;
};