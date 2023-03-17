import { ethers } from 'ethers';
import { ProfileExtension, SignedUserProfile } from 'dm3-lib-account';

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
    profileExtension: ProfileExtension;
    //TODO use SpamFilterRules once spam-filer is ready
    spamFilterRules?: unknown;
}

export async function checkToken(
    provider: ethers.providers.JsonRpcProvider,
    getSession: (ensName: string) => Promise<Session | null>,
    ensName: string,
    token: string,
): Promise<boolean> {
    const address = await provider.resolveName(ensName);

    if (!address) {
        throw Error(`Couln't resolve ENS name`);
    }

    const session = await getSession(ensName.toLocaleLowerCase());

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
