import { ethers } from 'ethers';
import { ProfileExtension, SignedUserProfile } from '@dm3-org/dm3-lib-profile';
import { logDebug, validateSchema } from '@dm3-org/dm3-lib-shared';
import { verify, decode } from 'jsonwebtoken';

//1Year
const TTL = 31536000000;

const authJwtPayloadSchema = {
    type: 'object',
    properties: {
        account: { type: 'string' },
        iat: { type: 'number' },
        exp: { type: 'number' },
        nbf: { type: 'number' },
    },
    required: ['account', 'iat', 'exp', 'nbf'],
    additionalProperties: false,
};

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
    console.log('check token for ', address);

    if (!address) {
        // Couldn't resolve ENS name
        logDebug({
            text: `checkToken - Couldn't resolve ENS name`,
        });
        return false;
    }

    const session = await getSession(ensName.toLocaleLowerCase());
    console.log('found session', session);

    //There is no account for the requesting account
    if (!session) {
        logDebug({
            text: `checkToken - There is no account for the requesting account`,
        });
        return false;
    }

    // check jwt for validity
    try {
        // will throw if signature is invalid or exp is in the past
        const jwtPayload = verify(token, serverSecret, {
            algorithms: ['HS256'],
        });
        console.log('jwt payload', decode(token));

        // check if payload is well formed
        if (
            typeof jwtPayload == 'string' ||
            !validateSchema(authJwtPayloadSchema, jwtPayload)
        ) {
            logDebug({
                text: `jwt malformed`,
            });
            return false;
        }

        // // check if expected fields are present
        // if (
        //     !('account' in jwtPayload) ||
        //     !('iat' in jwtPayload) ||
        //     !('exp' in jwtPayload) ||
        //     !('nbf' in jwtPayload)
        // ) {
        //     logDebug({
        //         text: `jwt invalid: content missing`,
        //     });
        //     return false;
        // }

        if (!jwtPayload.iat || jwtPayload.iat > Date.now() / 1000) {
            logDebug({
                text: `jwt invalid: iat missing or in the future`,
            });
            return false;
        }

        if (jwtPayload.account !== ensName) {
            logDebug({
                text: `jwt invalid: account mismatch`,
            });
            return false;
        }
    } catch (error) {
        logDebug({
            text: `jwt invalid: ${error}`,
            error,
        });
        return false;
    }

    // the token is valid only if all checks passed
    return true;
}
