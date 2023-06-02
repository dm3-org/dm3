import { logDebug, logError } from 'dm3-lib-shared';

export interface Interceptor {
    ensName: string;
    addr?: string;
    textRecords?: Record<string, string>;
}

function getInterceptor(ensName: string) {
    logDebug({
        text: `[getInterceptor]`,
        ensName,
        envInterceptor: process.env.interceptor,
    });

    if (process.env.interceptor) {
        const interceptor: Interceptor = JSON.parse(process.env.interceptor);
        logDebug({
            text: `[getInterceptor] interceptor`,
            ensName,
            envInterceptor: process.env.interceptor,
            interceptor,
        });

        const higherLevelDomain = ensName.split('.').splice(1).join('.');

        logDebug({
            text: `[getInterceptor] higherLevelDomain`,
            ensName,
            envInterceptor: process.env.interceptor,
            higherLevelDomain,
        });
        return interceptor.ensName === higherLevelDomain ? interceptor : null;
    }
}

// intercepts a text record query if the higher level domain name is registered
// in the interceptor env variable
export function interceptTextRecord(ensName: string, textRecordName: string) {
    try {
        const interceptor = getInterceptor(ensName);
        return interceptor?.textRecords
            ? interceptor.textRecords[textRecordName]
            : null;
    } catch (error) {
        logError({ text: 'Error while intercepting ', error });
    }
}

// intercepts a addr query if the higher level domain name is registered
// in the interceptor env variable
export function interceptAddr(ensName: string) {
    try {
        const interceptor = getInterceptor(ensName);
        return interceptor ? interceptor.addr : null;
    } catch (error) {
        logError({
            text: 'Error while intercepting',
            error,
        });
    }
}
