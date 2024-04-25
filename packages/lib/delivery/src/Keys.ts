import { v4 as uuidv4 } from 'uuid';
import { Session } from './Session';
import { checkSignature } from '@dm3-org/dm3-lib-crypto';
import { normalizeEnsName } from '@dm3-org/dm3-lib-profile';
import { sign } from 'jsonwebtoken';

export async function createChallenge(
    getSession: (accountAddress: string) => Promise<Session | null>,
    setSession: (accountAddress: string, session: Session) => Promise<void>,
    ensName: string,
) {
    const account = normalizeEnsName(ensName);
    const session = await getSession(account);

    if (!session) {
        throw Error('Session not found');
    }

    if (session.challenge) {
        return session.challenge;
    }
    const challenge = uuidv4();
    await setSession(account, { ...session, challenge });
    return challenge;
}

/**
 * Creates a JWT that can be used to authenticate the user with the given ens name
 * Resources:
 *  https://jwt.io/
 *  https://www.npmjs.com/package/jsonwebtoken
 * @param ensName ens id of the user
 * @param serverSecret secret value that is used to sign the JWT
 * @param validFor time in seconds the JWT is valid for, defaults to 1 hour
 * @returns JWT
 */
function generateJWT(
    ensName: string,
    serverSecret: string,
    validFor: number = 60 * 60,
) {
    return sign(
        { user: ensName, exp: Math.floor(Date.now() / 1000) + validFor },
        serverSecret,
    );
}

export async function createNewSessionToken(
    getSession: (ensName: string) => Promise<Session | null>,
    setSession: (ensName: string, session: Session) => Promise<void>,
    signature: string,
    ensName: string,
    serverSecret: string,
): Promise<string> {
    const session = await getSession(ensName);

    if (!session) {
        throw Error('Session not found');
    }

    if (!session.challenge) {
        throw Error('No pending challenge');
    }

    if (
        // todo: get public signing key from public profile
        !(await checkSignature(
            session.signedUserProfile.profile.publicSigningKey,
            session.challenge,
            signature,
        ))
    ) {
        throw Error('Signature invalid');
    }

    // todo: create jwt instead, which does not have to be stored in the session
    const jwt = generateJWT(ensName, serverSecret);
    // todo: remove challenge from session
    await setSession(ensName, { ...session, challenge: undefined, token: jwt });
    return jwt;
}
