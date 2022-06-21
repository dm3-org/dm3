import { formatAddress } from '../external-apis/InjectedWeb3API';
import { log } from '../shared/log';
import { Session } from './Session';
import { v4 as uuidv4 } from 'uuid';
import {
    checkProfileRegistryEntry,
    SignedProfileRegistryEntry,
} from '../account/Account';

export async function submitProfileRegistryEntry(
    getSession: (accountAddress: string) => Promise<Session | null>,
    setSession: (accountAddress: string, session: Session) => Promise<void>,
    accountAddress: string,
    signedProfileRegistryEntry: SignedProfileRegistryEntry,
    pendingConversations: Map<string, Set<string>>,
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
        const pending = pendingConversations.get(account);
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
