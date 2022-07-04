import { formatAddress } from '../external-apis/InjectedWeb3API';
import { log } from '../shared/log';
import { Session } from './Session';
import { v4 as uuidv4 } from 'uuid';
import {
    checkProfileRegistryEntry,
    checkStringSignature,
    SignedProfileRegistryEntry,
} from '../account/Account';

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

export async function submitProfileRegistryEntry(
    getSession: (accountAddress: string) => Promise<Session | null>,
    setSession: (accountAddress: string, session: Session) => Promise<void>,
    accountAddress: string,
    signedProfileRegistryEntry: SignedProfileRegistryEntry,
    getPendingConversations: (accountAddress: string) => Promise<string[]>,
    send: (socketId: string) => void,
): Promise<string> {
    log(`[submitKeys] for account ${accountAddress}`);
    const account = formatAddress(accountAddress);

    if (checkProfileRegistryEntry(signedProfileRegistryEntry, account)) {
        if (await getSession(account)) {
            throw Error('Profile exists already');
        }

        const session: Session = {
            account,
            signedProfileRegistryEntry,
            token: uuidv4(),
        };

        await setSession(account, session);
        const pending = await getPendingConversations(account);
        if (pending) {
            await Promise.all(
                Array.from(pending).map(async (pendingEntry) => {
                    const contact = formatAddress(pendingEntry);
                    const contactSession = await getSession(contact);
                    if (contactSession?.socketId) {
                        log(`- Send join notification to ${contact}`);
                        send(contactSession.socketId);
                    }
                }),
            );
        }
        return session.token;
    } else {
        log(`- Invalid signature`);
        throw Error('Signature invalid.');
    }
}

export async function getProfileRegistryEntry(
    getSession: (accountAddress: string) => Promise<Session | null>,
    accountAddress: string,
): Promise<SignedProfileRegistryEntry | undefined> {
    log(`[getProfileRegistryEntry] for account ${accountAddress}`);
    const account = formatAddress(accountAddress);
    const session = await getSession(account);
    if (session) {
        return session.signedProfileRegistryEntry;
    } else {
        return;
    }
}
