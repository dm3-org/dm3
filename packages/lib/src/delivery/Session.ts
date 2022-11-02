import { SignedUserProfile } from '../account/Account';
import { formatAddress } from '../external-apis/InjectedWeb3API';

export interface Session {
    account: string;
    signedUserProfile: SignedUserProfile;
    token: string;
    publicMessageHeadUri?: string;
    ttl?: undefined;
    socketId?: string;
    challenge?: string;
}

export async function checkToken(
    getSession: (accountAddress: string) => Promise<Session | null>,
    accountAddress: string,
    token: string,
): Promise<boolean> {
    const account = formatAddress(accountAddress);
    const session = await getSession(account);
    const passed = session && session?.token === token;

    return passed ? true : false;
}
