const LOG_LEVEL = process.env.LOG_LEVEL || 'info';

const LEVELS = {
    debug: 10,
    info: 20,
    warn: 30,
    error: 40,
};

const shouldLog = (level) => LEVELS[level] >= LEVELS[LOG_LEVEL];

const format = (level, message, meta) => {
    const timestamp = new Date().toISOString();
    if (meta) {
        return `[${timestamp}] ${level.toUpperCase()} ${message} ${JSON.stringify(meta)}`;
    }
    return `[${timestamp}] ${level.toUpperCase()} ${message}`;
};

const logger = {
    debug: (message, meta) => {
        if (shouldLog('debug')) {
            console.debug(format('debug', message, meta));
        }
    },
    info: (message, meta) => {
        if (shouldLog('info')) {
            console.info(format('info', message, meta));
        }
    },
    warn: (message, meta) => {
        if (shouldLog('warn')) {
            console.warn(format('warn', message, meta));
        }
    },
    error: (message, meta) => {
        if (shouldLog('error')) {
            console.error(format('error', message, meta));
        }
    },
};

module.exports = logger;

