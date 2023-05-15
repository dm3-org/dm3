import { log } from 'dm3-lib-shared';

export interface Interceptor {
    ensName: string;
    addr?: string;
    textRecords?: Record<string, string>;
}

function getInterceptor(ensName: string) {
    if (process.env.interceptor) {
        const interceptor: Interceptor = JSON.parse(process.env.interceptor);
        const higherLevelDomain = ensName.split('.').splice(1).join('.');
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
        log('Error while intercepting');
    }
}

// intercepts a addr query if the higher level domain name is registered
// in the interceptor env variable
export function interceptAddr(ensName: string) {
    try {
        const interceptor = getInterceptor(ensName);
        return interceptor ? interceptor.addr : null;
    } catch (e) {
        log('Error while intercepting');
    }
}
