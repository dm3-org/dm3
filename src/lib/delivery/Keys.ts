import { formatAddress } from '../external-apis/InjectedWeb3API';
import { log } from '../shared/log';
import { Session } from './Session';
import { v4 as uuidv4 } from 'uuid';
import {
    checkProfileRegistryEntry,
    SignedProfileRegistryEntry,
} from '../account/Account';

export function submitProfileRegistryEntry(
    sessions: Map<string, Session>,
    accountAddress: string,
    signedProfileRegistryEntry: SignedProfileRegistryEntry,
    pendingConversations: Map<string, Set<string>>,
    send: (socketId: string) => void,
): string {
    log(`[submitKeys] for account ${accountAddress}`);
    const account = formatAddress(accountAddress);

    if (checkProfileRegistryEntry(signedProfileRegistryEntry, account)) {
        if (sessions.has(account)) {
            throw Error('Profile exists already');
        }

        const session: Session = {
            account,
            signedProfileRegistryEntry,
            token: uuidv4(),
        };

        sessions.set(account, session);
        const pending = pendingConversations.get(account);
        if (pending) {
            pending.forEach((pendingEntry) => {
                const contact = formatAddress(pendingEntry);
                const contactSession = sessions.get(contact);
                if (contactSession?.socketId) {
                    log(`- Send join notification to ${contact}`);
                    send(contactSession.socketId);
                }
            });
        }
        return session.token;
    } else {
        log(`- Invalid signature`);
        throw Error('Signature invalid.');
    }
}

export function getProfileRegistryEntry(
    sessions: Map<string, Session>,
    accountAddress: string,
): SignedProfileRegistryEntry | undefined {
    log(`[getProfileRegistryEntry] for account ${accountAddress}`);
    const account = formatAddress(accountAddress);
    const session = sessions.get(account);
    if (session) {
        return session.signedProfileRegistryEntry;
    } else {
        return;
    }
}
