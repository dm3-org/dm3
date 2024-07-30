import { v4 as uuidv4 } from 'uuid';
import { Session } from './Session';
import { checkSignature } from '@dm3-org/dm3-lib-crypto';
import { normalizeEnsName } from '@dm3-org/dm3-lib-profile';
import { validateSchema } from '@dm3-org/dm3-lib-shared';
import { sign, verify } from 'jsonwebtoken';

const challengeJwtPayloadSchema = {
    type: 'object',
    properties: {
        account: { type: 'string' },
        iat: { type: 'number' },
        exp: { type: 'number' },
        nbf: { type: 'number' },
        challenge: { type: 'string' },
    },
    required: ['account', 'iat', 'exp', 'nbf', 'challenge'],
    additionalProperties: false,
};

export async function createChallenge(
    getAccount: (accountAddress: string) => Promise<Session | null>,
    ensName: string,
    serverSecret: string,
) {
    const account = normalizeEnsName(ensName);
    const session = await getAccount(account);

    if (!session) {
        throw Error('Session not found');
    }

    // generates a jwt with a new, unique challenge
    const challenge = sign(
        { account: ensName, challenge: uuidv4() },
        serverSecret,
        {
            expiresIn: 15 * 60, // challenge is valid for 15 minutes
            notBefore: 0, // can not be used before now
        },
    );
    return challenge;
}

/**
 * Creates a JWT that can be used to authenticate the user with the given ens name
 * Very helpful in unit tests, too, since it can be used to authenticate the user
 * (only if you know the server secret)
 * Resources:
 *  https://jwt.io/
 *  https://www.npmjs.com/package/jsonwebtoken
 * @param ensName ens id of the account
 * @param serverSecret secret value that is used to sign the JWT
 * @param validFor time in seconds the JWT is valid for, defaults to 1 hour
 * @returns JWT
 */
export function generateAuthJWT(
    ensName: string,
    serverSecret: string,
    validFor: number = 60 * 60,
) {
    return sign({ account: normalizeEnsName(ensName) }, serverSecret, {
        expiresIn: validFor,
        notBefore: 0, // can not be used before now
    });
}

export async function createNewSessionToken(
    getAccount: (ensName: string) => Promise<Session | null>,
    signature: string,
    challenge: string,
    ensName: string,
    serverSecret: string,
): Promise<string> {
    const session = await getAccount(ensName);

    console.log('Signature is : ', signature);
    console.log('Challenge is : ', challenge);
    console.log('ENS name is : ', ensName);
    console.log('Account session is :::::::::::::::: ', session);

    if (!session) {
        throw Error('Session not found');
    }

    // check the challenge jwt the user provided. It must be a valid
    // jwt signed by us.
    const challengePayload = verify(challenge, serverSecret, {
        algorithms: ['HS256'],
    });

    console.log(
        'Account challengePayload is :::::::::::::::: ',
        challengePayload,
    );

    // check if the payload of the challenge-jwt has the proper schema
    if (
        typeof challengePayload == 'string' ||
        !validateSchema(challengeJwtPayloadSchema, challengePayload)
    ) {
        throw Error('Provided challenge is not valid');
    }

    if (
        // todo: get public signing key from public profile
        !(await checkSignature(
            session.signedUserProfile.profile.publicSigningKey,
            // we expect the whole jwt to be signed, not just the challenge-part of the payload.
            // This way, the client does not have to understand the jwt.
            challenge,
            signature,
        ))
    ) {
        throw Error('Signature invalid');
    }

    const jwt = generateAuthJWT(ensName, serverSecret);
    return jwt;
}
