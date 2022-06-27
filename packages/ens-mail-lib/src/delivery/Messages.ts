import { formatAddress } from '../external-apis/InjectedWeb3API';
import { log } from '../shared/log';
import { EncryptionEnvelop } from '../messaging/Messaging';
import { getConversationId } from '../storage/Storage';
import { checkToken, Session } from './Session';

export interface Acknoledgment {
    contactAddress: string;
    messageDeliveryServiceTimestamp: number;
}

// fetch new messages
export async function getMessages(
    loadMessages: (
        conversationId: string,
        offset: number,
        size: number,
    ) => Promise<EncryptionEnvelop[]>,
    accountAddress: string,
    contactAddress: string,
) {
    log(`[getMessages]`);

    const account = formatAddress(accountAddress);
    const contact = formatAddress(contactAddress);
    const conversationId = getConversationId(contact, account);

    log(`- Conversations id: ${conversationId}`);

    const receivedMessages: EncryptionEnvelop[] = await loadMessages(
        conversationId,
        0,
        50,
    );

    const messages = receivedMessages.filter(
        (envelop) => formatAddress(envelop.to) === account,
    );

    log(`- ${receivedMessages?.length} messages`);

    return messages;
}

// buffer message until delivery and sync acknoledgment
export async function incomingMessage(
    data: { envelop: EncryptionEnvelop; token: string },
    getSession: (accountAddress: string) => Promise<Session | null>,
    storeNewMessage: (
        conversationId: string,
        envelop: EncryptionEnvelop,
    ) => Promise<void>,
    send: (socketId: string, envelop: EncryptionEnvelop) => void,
): Promise<void> {
    log('[incoming message]');
    const envelop = {
        ...data.envelop,
        deliveryServiceIncommingTimestamp: new Date().getTime(),
    };
    const account = formatAddress(formatAddress(data.envelop.from));
    const contact = formatAddress(formatAddress(data.envelop.to));
    const conversationId = getConversationId(account, contact);
    log(`- Conversations id: ${conversationId}`);

    if (await checkToken(getSession, account, data.token)) {
        storeNewMessage(conversationId, envelop);
        const contactSession = await getSession(contact);
        if (contactSession?.socketId) {
            log(`- Forwarding message to ${contact}`);
            send(contactSession.socketId, envelop);
        }
    } else {
        throw Error('Token check failed');
    }
}

// provide a new user with the addresses of accounts which tried to send messages to them
export async function getPendingConversations(
    pendingConversations: Map<string, Set<string>>,
    accountAddress: string,
): Promise<{
    pendingConversations: Map<string, Set<string>>;
    pendingConversationsForAccount: string[];
}> {
    const account = formatAddress(accountAddress);
    log(`[getPendingConversations] for account ${account}`);

    const newPendingConversations = new Map<string, Set<string>>(
        pendingConversations,
    );
    const conversations = newPendingConversations.get(account);
    newPendingConversations.set(account, new Set<string>());
    if (conversations) {
        return {
            pendingConversations: newPendingConversations,
            pendingConversationsForAccount: Array.from(conversations),
        };
    } else {
        return {
            pendingConversations: newPendingConversations,
            pendingConversationsForAccount: [],
        };
    }
}
export type GetPendingConversations = typeof getPendingConversations;

// create an entry that is used to notify a new user
// that there are already pending messages adderssed to them
export async function createPendingEntry(
    accountAddress: string,
    contactAddress: string,
    token: string,
    getSession: (accountAddress: string) => Promise<Session | null>,
    pendingConversations: Map<string, Set<string>>,
): Promise<Map<string, Set<string>>> {
    log('[createPendingEntry] pending message');
    const account = formatAddress(accountAddress);
    const contact = formatAddress(contactAddress);
    log(`- Pending message from ${account} to ${contact}`);

    if (await checkToken(getSession, account, token)) {
        const newPendingConversations = new Map<string, Set<string>>(
            pendingConversations,
        );
        if (pendingConversations.has(contact)) {
            const conversations = pendingConversations.get(
                contact,
            ) as Set<string>;
            newPendingConversations.set(contact, conversations.add(account));
        } else {
            newPendingConversations.set(contact, new Set<string>([account]));
        }

        return newPendingConversations;
    } else {
        throw Error('Token check failed');
    }
}
