import { formatAddress } from '../external-apis/InjectedWeb3API';

import { Session } from './Session';
import { v4 as uuidv4 } from 'uuid';
import {
    checkUserProfile,
    checkStringSignature,
    SignedUserProfile,
} from '../account/Account';
import { getDefaultProfileExtension } from '../account/profileExtension/ProfileExtension';

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

    if (!session.challenge) {
        const challenge = uuidv4();
        await setSession(account, { ...session, challenge });
        return challenge;
    } else {
        return session.challenge;
    }
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
