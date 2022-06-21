import { SignedProfileRegistryEntry } from '../account/Account';
import { formatAddress } from '../external-apis/InjectedWeb3API';
import { log } from '../shared/log';

export interface Session {
    account: string;
    signedProfileRegistryEntry: SignedProfileRegistryEntry;
    token: string;
    publicMessageHeadUri?: string;
    ttl?: undefined;
    socketId?: string;
}

export async function checkToken(
    getSession: (accountAddress: string) => Promise<Session | null>,
    accountAddress: string,
    token: string,
): Promise<boolean> {
    const account = formatAddress(accountAddress);
    const session = await getSession(account);

    const passed = session && session?.token === token;
    log(`- Token check for ${account}: ${passed ? 'PASSED' : 'FAILED'}`);
    return passed ? true : false;
}
