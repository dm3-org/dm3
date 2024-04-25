import { ethers } from 'ethers';
import { ProfileExtension, SignedUserProfile } from '@dm3-org/dm3-lib-profile';
import { logDebug } from '@dm3-org/dm3-lib-shared';
import { verify } from 'jsonwebtoken';

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
    serverSecret: string,
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

    //There is no account for the requesting account
    if (!session) {
        logDebug({
            text: `checkToken - There is no account for the requesting account`,
        });
        return false;
    }

    // check jwt for validity
    try {
        // will throw if signature is invalid
        const jwtPayload = verify(token, serverSecret, {
            algorithms: ['HS256'],
        });
        //@ts-ignore
        const { user, exp, iat } = jwtPayload;
        if (!user || user !== ensName) {
            logDebug({
                text: `jwt invalid: user mismatch`,
            });
            return false;
        }
        if (!iat || iat > Date.now() / 1000) {
            logDebug({
                text: `jwt invalid: iat in the future`,
            });
            return false;
        }
        if (!exp || exp < Date.now() / 1000) {
            logDebug({
                text: `jwt invalid: expired`,
            });
            return false;
        }
    } catch (error) {
        logDebug({
            text: `jwt invalid: signature error`,
            error,
        });
        return false;
    }

    // the token is valid only if all checks passed
    return true;
}
