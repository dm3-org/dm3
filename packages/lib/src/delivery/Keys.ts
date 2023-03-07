import { v4 as uuidv4 } from 'uuid';
import { Session } from './Session';
import { checkSignature } from '../crypto';
import { normalizeEnsName } from '../account/src';

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

export async function createNewSessionToken(
    getSession: (ensName: string) => Promise<Session | null>,
    setSession: (ensName: string, session: Session) => Promise<void>,
    signature: string,
    ensName: string,
): Promise<string> {
    const session = await getSession(ensName);

    if (!session) {
        throw Error('Session not found');
    }

    if (!session.challenge) {
        throw Error('No pending challenge');
    }

    if (
        !(await checkSignature(
            session.signedUserProfile.profile.publicSigningKey,
            session.challenge,
            signature,
        ))
    ) {
        throw Error('Signature invalid');
    }

    const token = uuidv4();
    await setSession(ensName, { ...session, challenge: undefined, token });
    return token;
}
