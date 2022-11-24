import { SignedUserProfile } from '../account/Account';
import { formatAddress } from '../external-apis/InjectedWeb3API';

//1Year
const TTL = 31536000000;

export interface Session {
    account: string;
    signedUserProfile: SignedUserProfile;
    token: string;
    publicMessageHeadUri?: string;
    createdAt: number;
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
    //There is now account for the requesting accoung
    if (!session) {
        return false;
    }

    const tokenIsValid = token === session.token;

    //The account has a session but the token is wrong
    if (!tokenIsValid) {
        return false;
    }

    const isTokenExpired = session.createdAt + TTL < new Date().getTime();
    //The token is exceeded
    if (isTokenExpired) {
        return false;
    }

    return true;
}
