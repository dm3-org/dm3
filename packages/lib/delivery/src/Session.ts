import { ethers } from 'ethers';
import { ProfileExtension, SignedUserProfile } from 'dm3-lib-profile';
import { logDebug } from 'dm3-lib-shared';

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
    logDebug({
        text: 'checkToken',
    });
    const address = await provider.resolveName(ensName);

    if (!address) {
        // Couln't resolve ENS name
        logDebug({
            text: `checkToken - Couln't resolve ENS name`,
        });
        return false;
    }

    const session = await getSession(ensName.toLocaleLowerCase());

    //There is no account for the requesting accoung
    if (!session) {
        logDebug({
            text: `checkToken - There is no account for the requesting accoung`,
        });
        return false;
    }

    const tokenIsValid = token === session.token;

    //The account has a session but the token is wrong
    if (!tokenIsValid) {
        logDebug({
            text: `checkToken - The account has a session but the token is wrong`,
        });
        return false;
    }

    const isTokenExpired = session.createdAt + TTL < new Date().getTime();
    //The token is exceeded
    if (isTokenExpired) {
        logDebug({
            text: `checkToken - The token is exceeded`,
        });
        return false;
    }

    return true;
}
