/* eslint no-console: 0 */
export interface LogOptions {
    customLogger?: (msg: string, level: string) => void;
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
    msg: string,
    level: string,
    currentLevel: number,
    options?: LogOptions,
) {
    if (options?.customLogger) {
        options.customLogger(msg, level);
    } else if (levels[level] !== undefined && levels[level] <= currentLevel) {
        switch (level) {
            case 'error':
                console.error(msg);
                break;

            case 'warning':
                console.warn(msg);
                break;

            case 'info':
            case 'debug':
            default:
                console.log(msg);
        }
    }
}

export function log(msg: string, level: string, options?: LogOptions) {
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

export function logInfo(msg: string, options?: LogOptions) {
    log(msg, 'info', options);
}

export function logError(msg: string, options?: LogOptions) {
    log(msg, 'info', options);
}

export function logWarning(msg: string, options?: LogOptions) {
    log(msg, 'warning', options);
}

export function logDebug(msg: string, options?: LogOptions) {
    log(msg, 'debug', options);
}
