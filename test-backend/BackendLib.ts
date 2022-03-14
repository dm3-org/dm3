import * as Lib from '../src/lib';

export interface Session {
    account: string;
    challenge?: string;
    token?: string;
    ttl?: undefined;
    socketId?: string;
    keys?: Partial<Lib.Keys>;
}

export function checkToken(
    sessions: Map<string, Session>,
    accountAddress: string,
    token: string,
): boolean {
    const account = Lib.formatAddress(accountAddress);
    const session = sessions.get(account);
    const passed = session && session?.token === token;
    console.log(
        `- Token check for ${account}: ${passed ? 'PASSED' : 'FAILED'}`,
    );
    return passed ? true : false;
}
