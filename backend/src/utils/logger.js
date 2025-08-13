const logLevels = {
  error: 0,
  warn: 1,
  info: 2,
  debug: 3
};

const currentLevel = logLevels[process.env.LOG_LEVEL || 'info'];

class Logger {
  constructor() {
    this.timestamp = () => new Date().toISOString();
  }

  log(level, message, data = {}) {
    if (logLevels[level] <= currentLevel) {
      const logEntry = {
        timestamp: this.timestamp(),
        level: level.toUpperCase(),
        message,
        ...data
      };

      if (level === 'error') {
        console.error(JSON.stringify(logEntry));
      } else if (level === 'warn') {
        console.warn(JSON.stringify(logEntry));
      } else if (level === 'info') {
        console.info(JSON.stringify(logEntry));
      } else if (level === 'debug') {
        console.debug(JSON.stringify(logEntry));
      }
    }
  }

  error(message, data = {}) {
    this.log('error', message, data);
  }

  warn(message, data = {}) {
    this.log('warn', message, data);
  }

  info(message, data = {}) {
    this.log('info', message, data);
  }

  debug(message, data = {}) {
    this.log('debug', message, data);
  }
}

export const logger = new Logger();
