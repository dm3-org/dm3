import { Account, formatAddress } from '.';
import { Envelop, sortEnvelops, getId } from './Messaging';
import { Connection } from './Web3Provider';

export interface MessageDB {
    conversations: Map<string, Envelop[]>;
}

export function createDB(): MessageDB {
    return {
        conversations: new Map<string, Envelop[]>(),
    };
}

export function getConversation(
    contact: string,
    connection: Connection,
): Envelop[] {
    const conversationId = getConversationId(
        contact,
        connection.account.address,
    );
    const envelops = connection.db.conversations.get(conversationId);
    return envelops ? envelops : [];
}

export function storeMessages(envelops: Envelop[], connection: Connection) {
    for (let envelop of envelops) {
        const contactAddress =
            envelop.message.from === connection.account.address
                ? envelop.message.to
                : envelop.message.from;
        const conversationId = getConversationId(
            contactAddress,
            connection.account.address,
        );
        const prevEnvelops = getConversation(contactAddress, connection);

        if (!envelop.id) {
            envelop.id = getId(envelop);
        }

        if (prevEnvelops.length === 0) {
            connection.db.conversations.set(conversationId, [envelop]);
        } else if (
            prevEnvelops[prevEnvelops.length - 1].message.timestamp <
            envelop.message.timestamp
        ) {
            connection.db.conversations.set(conversationId, [
                ...prevEnvelops,
                envelop,
            ]);
        } else {
            const isNew = !prevEnvelops.find(
                (prevEnvelop) => prevEnvelop.id === envelop.id,
            );
            if (isNew) {
                connection.db.conversations.set(
                    conversationId,
                    sortEnvelops([...prevEnvelops, envelop]),
                );
            }
        }
    }
}

export function getConversationId(accountA: string, accountB: string): string {
    return [formatAddress(accountA), formatAddress(accountB)].sort().join();
}
