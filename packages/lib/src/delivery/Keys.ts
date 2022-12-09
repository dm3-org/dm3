import { formatAddress } from '../external-apis/InjectedWeb3API';

import { v4 as uuidv4 } from 'uuid';
import { checkStringSignature } from '../account/Account';
import { Session } from './Session';

export async function createChallenge(
    getSession: (accountAddress: string) => Promise<Session | null>,
    setSession: (accountAddress: string, session: Session) => Promise<void>,
    accountAddress: string,
) {
    const account = formatAddress(accountAddress);
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
    getSession: (accountAddress: string) => Promise<Session | null>,
    setSession: (accountAddress: string, session: Session) => Promise<void>,
    signature: string,
    accountAddress: string,
): Promise<string> {
    const account = formatAddress(accountAddress);
    const session = await getSession(account);

    if (!session) {
        throw Error('Session not found');
    }

    if (!session.challenge) {
        throw Error('No pending challenge');
    }

    if (checkStringSignature(session.challenge, signature, account)) {
        const token = uuidv4();
        await setSession(account, { ...session, challenge: undefined, token });
        return token;
    } else {
        throw Error('Signature invalid');
    }
}
