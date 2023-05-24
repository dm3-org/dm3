import { log } from 'dm3-lib-shared';

export interface Interceptor {
    ensName: string;
    addr?: string;
    textRecords?: Record<string, string>;
}

function getInterceptor(ensName: string) {
    log(
        `[getInterceptor] for ${ensName} (env: ${process.env.interceptor})`,
        'debug',
    );

    if (process.env.interceptor) {
        const interceptor: Interceptor = JSON.parse(process.env.interceptor);
        log(
            `[getInterceptor] interceptor ${JSON.stringify(interceptor)}`,
            'debug',
        );
        const higherLevelDomain = ensName.split('.').splice(1).join('.');
        log(`[getInterceptor] higherLevelDomain ${higherLevelDomain}`, 'debug');
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
    } catch (e) {
        log('Error while intercepting ' + JSON.stringify(e), 'error');
    }
}

// intercepts a addr query if the higher level domain name is registered
// in the interceptor env variable
export function interceptAddr(ensName: string) {
    try {
        const interceptor = getInterceptor(ensName);
        return interceptor ? interceptor.addr : null;
    } catch (e) {
        log('Error while intercepting' + JSON.stringify(e), 'error');
    }
}
