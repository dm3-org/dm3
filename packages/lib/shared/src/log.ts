/* eslint no-console: 0 */
export interface LogOptions {
    customLogger?: (msg: any, level: string) => void;
}

const levels: Record<string, number> = {
    error: 0,
    warn: 1,
    info: 2,
    http: 3,
    verbose: 4,
    debug: 5,
    silly: 6,
};

function execLog(
    message: any,
    level: string,
    currentLevel: number,
    options?: LogOptions,
) {
    const msgObject = JSON.stringify({
        message,
        level,
    });

    if (options?.customLogger) {
        options.customLogger(message, level);
    } else if (levels[level] !== undefined && levels[level] <= currentLevel) {
        switch (level) {
            case 'error':
                console.error(msgObject);
                break;

            case 'warning':
                console.warn(msgObject);
                break;

            case 'info':
            case 'debug':
            default:
                console.log(msgObject);
        }
    }
}

export function log(msg: any, level: string, options?: LogOptions) {
    let currentLevel = 2;
    try {
        const envLevel = process.env.LOG_LEVEL;
        if (envLevel) {
            currentLevel = parseInt(envLevel);
        }
    } catch (e) {
        execLog(
            `Couldn't read process.env.LOG_LEVEL ` + JSON.stringify(e),
            'error',
            2,
            options,
        );
    }

    execLog(msg, level, currentLevel, options);
}

export function logInfo(msg: any, options?: LogOptions) {
    log(msg, 'info', options);
}

export function logError(msg: any, options?: LogOptions) {
    log(msg, 'info', options);
}

export function logWarning(msg: any, options?: LogOptions) {
    log(msg, 'warning', options);
}

export function logDebug(msg: any, options?: LogOptions) {
    log(msg, 'debug', options);
}
