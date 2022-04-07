import { formatAddress } from '../external-apis/InjectedWeb3API';
import { log } from '../shared/log';
import { EncryptionEnvelop } from '../messaging/Messaging';
import { getConversationId } from '../storage/Storage';
import { checkToken, Session } from './Session';

export interface Acknoledgment {
    contactAddress: string;
    messageDeliveryServiceTimestamp: number;
}

export function getMessages(
    sessions: Map<string, Session>,
    messages: Map<string, EncryptionEnvelop[]>,
    accountAddress: string,
    contactAddress: string,
    token: string,
) {
    log(`[getMessages]`);

    const account = formatAddress(accountAddress);
    const contact = formatAddress(contactAddress);
    const conversationId = getConversationId(contact, account);

    log(`- Conversations id: ${conversationId}`);

    if (checkToken(sessions, account, token)) {
        const receivedMessages: EncryptionEnvelop[] = (
            messages.has(conversationId) ? messages.get(conversationId) : []
        ) as EncryptionEnvelop[];

        const forAccount = receivedMessages.filter(
            (envelop) => formatAddress(envelop.to) === account,
        );

        log(`- ${receivedMessages?.length} messages`);

        return {
            messages: forAccount,
        };
    } else {
        throw Error('Token check failed');
    }
}

export function getPendingConversations(
    sessions: Map<string, Session>,
    pendingConversations: Map<string, Set<string>>,
    accountAddress: string,
    token: string,
) {
    log(`[getPendingConversations]`);
    const account = formatAddress(accountAddress);

    log(`- Account: ${accountAddress}`);

    if (checkToken(sessions, account, token)) {
        const conversations = pendingConversations.get(account);
        pendingConversations.set(account, new Set<string>());
        if (conversations) {
            return { pendingConversations: Array.from(conversations) };
        } else {
            return { pendingConversations: [] };
        }
    } else {
        throw Error('Token check failed');
    }
}
export type GetPendingConversations = typeof getPendingConversations;

export function incomingMessage(
    data: { envelop: EncryptionEnvelop; token: string },
    sessions: Map<string, Session>,
    messages: Map<string, EncryptionEnvelop[]>,
    send: (socketId: string, envelop: EncryptionEnvelop) => void,
): string {
    const envelop = {
        ...data.envelop,
        deliveryServiceIncommingTimestamp: new Date().getTime(),
    };
    const account = formatAddress(formatAddress(data.envelop.from));
    const contact = formatAddress(formatAddress(data.envelop.to));
    const conversationId = getConversationId(account, contact);
    log(`- Conversations id: ${conversationId}`);

    if (checkToken(sessions, account, data.token)) {
        const conversation = messages.has(conversationId)
            ? (messages.get(conversationId) as EncryptionEnvelop[])
            : [];

        conversation.push(envelop);

        if (!messages.has(conversationId)) {
            messages.set(conversationId, conversation);
        }

        const contactSession = sessions.get(contact);
        if (contactSession?.socketId) {
            log(`- Forwarding message to ${contact}`);
            send(contactSession.socketId, envelop);
        }

        return 'success';
    } else {
        throw Error('Token check failed');
    }
}

export function createPendingEntry(
    accountAddress: string,
    contactAddress: string,
    token: string,
    sessions: Map<string, Session>,
    pendingConversations: Map<string, Set<string>>,
): string {
    const account = formatAddress(accountAddress);
    const contact = formatAddress(contactAddress);
    log(`- Pending message from ${account} to ${contact}`);

    if (checkToken(sessions, account, token)) {
        if (pendingConversations.has(contact)) {
            const conversations = pendingConversations.get(
                contact,
            ) as Set<string>;
            pendingConversations.set(contact, conversations.add(account));
        } else {
            pendingConversations.set(contact, new Set<string>([account]));
        }

        return 'success';
    } else {
        throw Error('Token check failed');
    }
}

export function handleSyncAcknoledgment(
    accountAddress: string,
    acknoledgments: Acknoledgment[],
    token: string,
    sessions: Map<string, Session>,
    messages: Map<string, EncryptionEnvelop[]>,
): Map<string, EncryptionEnvelop[]> {
    log('[handleSyncAcknoledgment]');
    const account = formatAddress(accountAddress);

    const newMessages = new Map<string, EncryptionEnvelop[]>(messages);

    if (checkToken(sessions, account, token)) {
        for (const acknoledgment of acknoledgments) {
            const contact = formatAddress(acknoledgment.contactAddress);
            const conversationId = getConversationId(account, contact);
            log(`- Handling acknoledgment for conversation ${conversationId}`);
            const conversation = newMessages.get(conversationId);

            if (conversation) {
                //remove all messages smaller or equal than timestamp and addressed to the account address
                const messagesToKeep = conversation.filter(
                    (envelop) =>
                        envelop.deliveryServiceIncommingTimestamp! >
                            acknoledgment.messageDeliveryServiceTimestamp ||
                        formatAddress(envelop.from) === accountAddress,
                );

                newMessages.set(conversationId, messagesToKeep);
                log(
                    `- Removing ${
                        conversation.length - messagesToKeep.length
                    } messages`,
                );
            }
        }

        return newMessages;
    } else {
        throw Error('Token check failed');
    }
}
