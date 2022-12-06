import { formatAddress } from '../external-apis/InjectedWeb3API';

import { Session } from './Session';
import { v4 as uuidv4 } from 'uuid';
import {
    checkUserProfile,
    checkStringSignature,
    SignedUserProfile,
} from '../account/Account';
import { MutableProfileExtension } from '../account';
import { getDefaultMutableProfileExtension } from '../account/mutableProfileExtension/MutableProfileExtension';

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

export async function submitUserProfile(
    getSession: (accountAddress: string) => Promise<Session | null>,
    setSession: (accountAddress: string, session: Session) => Promise<void>,
    accountAddress: string,
    signedUserProfile: SignedUserProfile,
    getPendingConversations: (accountAddress: string) => Promise<string[]>,
    send: (socketId: string) => void,
): Promise<string> {
    const account = formatAddress(accountAddress);

    if (checkUserProfile(signedUserProfile, account)) {
        if (await getSession(account)) {
            throw Error('Profile exists already');
        }

        const session: Session = {
            account,
            signedUserProfile,
            token: uuidv4(),
            createdAt: new Date().getTime(),
            profileExtension: getDefaultMutableProfileExtension(),
        };

        await setSession(account, session);
        const pending = await getPendingConversations(account);
        if (pending) {
            await Promise.all(
                Array.from(pending).map(async (pendingEntry) => {
                    const contact = formatAddress(pendingEntry);
                    const contactSession = await getSession(contact);
                    if (contactSession?.socketId) {
                        send(contactSession.socketId);
                    }
                }),
            );
        }
        return session.token;
    } else {
        throw Error('Signature invalid.');
    }
}

export async function getUserProfile(
    getSession: (accountAddress: string) => Promise<Session | null>,
    accountAddress: string,
): Promise<SignedUserProfile | undefined> {
    const account = formatAddress(accountAddress);
    const session = await getSession(account);
    if (session) {
        return session.signedUserProfile;
    } else {
        return;
    }
}
