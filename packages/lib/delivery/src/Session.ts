import { ProfileExtension, SignedUserProfile } from '@dm3-org/dm3-lib-profile';
import { validateSchema } from '@dm3-org/dm3-lib-shared';
import { ethers } from 'ethers';
import { decode, verify } from 'jsonwebtoken';

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
    doesAccountExist: (ensName: string) => Promise<Boolean>,
    ensName: string,
    token: string,
    serverSecret: string,
): Promise<boolean> {
    if (!(await doesAccountExist(ensName.toLocaleLowerCase()))) {
        console.debug('there is no account for this ens name: ', ensName);
        return false;
    }

    // check jwt for validity
    try {
        // will throw if signature is invalid or exp is in the past
        const jwtPayload = verify(token, serverSecret, {
            algorithms: ['HS256'],
        });

        // check if payload is well formed
        if (
            typeof jwtPayload === 'string' ||
            !validateSchema(authJwtPayloadSchema, jwtPayload)
        ) {
            console.debug('jwt malformed');
            return false;
        }

        if (!jwtPayload.iat || jwtPayload.iat > Date.now() / 1000) {
            console.debug('jwt invalid: iat missing or in the future');
            return false;
        }

        if (jwtPayload.account !== ensName) {
            console.debug('jwt invalid: account mismatch');
            return false;
        }
    } catch (error) {
        console.debug(`jwt invalid: ${error}`);
        return false;
    }

    // the token is valid only if all checks passed
    return true;
}
