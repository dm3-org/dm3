import { formatAddress } from '.';
import { decryptSafely, encryptSafely, EthEncryptedData } from './Encryption';
import { Envelop, sortEnvelops, getId } from './Messaging';
import { Connection } from './Web3Provider';

export interface MessageDB {
    conversations: Map<string, Envelop[]>;
    syncNotification?: (synced: boolean) => void;
    synced: boolean;
}

function replacer(key: string, value: any) {
    if (value instanceof Map) {
        return {
            dataType: 'Map',
            value: Array.from(value.entries()),
        };
    } else {
        return value;
    }
}

function reviver(key: string, value: any) {
    if (typeof value === 'object' && value !== null) {
        if (value.dataType === 'Map') {
            return new Map(value.value);
        }
    }
    return value;
}

function setSyncedState(synced: boolean, db: MessageDB) {
    db.synced = synced;
    if (db.syncNotification) {
        db.syncNotification(synced);
    }
}

export function createDB(
    syncNotification?: (synced: boolean) => void,
): MessageDB {
    if (syncNotification) {
        syncNotification(true);
    }
    return {
        conversations: new Map<string, Envelop[]>(),
        synced: true,
        syncNotification,
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
            setSyncedState(false, connection.db);
        } else if (
            prevEnvelops[prevEnvelops.length - 1].message.timestamp <
            envelop.message.timestamp
        ) {
            connection.db.conversations.set(conversationId, [
                ...prevEnvelops,
                envelop,
            ]);
            setSyncedState(false, connection.db);
        } else {
            const isNew = !prevEnvelops.find(
                (prevEnvelop) => prevEnvelop.id === envelop.id,
            );
            if (isNew) {
                connection.db.conversations.set(
                    conversationId,
                    sortEnvelops([...prevEnvelops, envelop]),
                );
                setSyncedState(false, connection.db);
            }
        }
    }
}

export function sync(connection: Connection): {
    version: string;
    payload: EthEncryptedData;
} {
    setSyncedState(true, connection.db);

    if (!connection.account.keys?.publicMessagingKey) {
        throw Error('No key to encrypt');
    }

    const payload = encryptSafely({
        publicKey: connection.account.keys?.publicMessagingKey,
        data: JSON.stringify({
            conversations: JSON.stringify(
                connection.db.conversations,
                replacer,
            ),
        }),
        version: 'x25519-xsalsa20-poly1305',
    });

    return {
        version: 'ens-mail-encryption-1',
        payload,
    };
}

export function load(
    connection: Connection,
    data: {
        version: string;
        payload: EthEncryptedData;
    },
) {
    if (!connection.account.keys?.privateMessagingKey) {
        throw Error('No key to encrypt');
    }

    const decryptedPayload: { conversations: string } = JSON.parse(
        decryptSafely({
            encryptedData: data.payload,
            privateKey: connection.account.keys.privateMessagingKey,
        }) as string,
    );

    connection.db.conversations = JSON.parse(
        decryptedPayload.conversations,
        reviver,
    );
    setSyncedState(true, connection.db);
}

export function getConversationId(accountA: string, accountB: string): string {
    return [formatAddress(accountA), formatAddress(accountB)].sort().join();
}
