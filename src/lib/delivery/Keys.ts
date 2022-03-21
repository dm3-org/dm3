import { PublicKeys } from '..';
import { formatAddress } from '../external-apis/InjectedWeb3API';
import { log } from '../shared/log';
import { checkToken, Session } from './Session';

export function submitPublicKeys(
    sessions: Map<string, Session>,
    accountAddress: string,
    publicKeys: PublicKeys,
    pendingConversations: Map<string, Set<string>>,
    send: (socketId: string) => void,
    token: string,
) {
    log(`[submitKeys] for account ${accountAddress}`);
    const account = formatAddress(accountAddress);

    if (checkToken(sessions, account, token)) {
        (sessions.get(account) as Session).keys = publicKeys;
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
    } else {
        throw Error('Token check failed');
    }
}

export function getPublicKeys(
    sessions: Map<string, Session>,
    accountAddress: string,
): Partial<PublicKeys> {
    log(`[getPublicKeys] for account ${accountAddress}`);
    const account = formatAddress(accountAddress);

    if (sessions.get(account)?.keys) {
        return {
            publicMessagingKey: sessions.get(account)?.keys?.publicMessagingKey,
            publicSigningKey: sessions.get(account)?.keys?.publicSigningKey,
            publicKey: sessions.get(account)?.keys?.publicKey,
        };
    } else {
        return {};
    }
}
