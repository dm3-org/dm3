import { ethers } from 'ethers';
import { formatAddress, MessageState, PublicKeys } from '.';
import { Keys } from './Account';
import { encryptSafely, EthEncryptedData } from './Encryption';
import { decryptUsingProvider } from './external-apis/InjectedWeb3API';
import { Envelop, getId } from './Messaging';
import { Connection } from './Web3Provider';

export interface StorageEnvelopContainer {
    messageState: MessageState;
    envelop: Envelop;
}

export interface UserDB {
    conversations: Map<string, StorageEnvelopContainer[]>;
    keys?: Keys;
    syncNotifications: ((synced: boolean) => void)[];
    contactNotification?: () => void;
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

function setSyncedState(synced: boolean, connection: Connection) {
    connection.db.synced = synced;
    connection.db.syncNotifications.forEach((notification) =>
        notification(synced),
    );

    if (connection.db.contactNotification) {
        connection.db.contactNotification();
    }
}

export function createDB(
    syncNotifications: ((synced: boolean) => void)[],
): UserDB {
    return {
        conversations: new Map<string, StorageEnvelopContainer[]>(),
        synced: false,
        syncNotifications,
    };
}

export function getConversation(
    contact: string,
    connection: Connection,
): StorageEnvelopContainer[] {
    const conversationId = getConversationId(
        contact,
        connection.account.address,
    );
    const envelops = connection.db.conversations.get(conversationId);
    return envelops ? envelops : [];
}

export function sortEnvelops(
    containers: StorageEnvelopContainer[],
): StorageEnvelopContainer[] {
    return containers.sort(
        (a, b) => a.envelop.message.timestamp - b.envelop.message.timestamp,
    );
}

export function storeMessages(
    containers: StorageEnvelopContainer[],
    connection: Connection,
) {
    for (let container of containers) {
        const contactAddress =
            container.envelop.message.from === connection.account.address
                ? container.envelop.message.to
                : container.envelop.message.from;
        const conversationId = getConversationId(
            contactAddress,
            connection.account.address,
        );
        const prevContainers = getConversation(contactAddress, connection);

        if (!container.envelop.id) {
            container.envelop.id = getId(container.envelop);
        }

        if (prevContainers.length === 0) {
            connection.db.conversations.set(conversationId, [container]);
            setSyncedState(false, connection);
        } else if (
            prevContainers[prevContainers.length - 1].envelop.message
                .timestamp < container.envelop.message.timestamp
        ) {
            connection.db.conversations.set(conversationId, [
                ...prevContainers,
                container,
            ]);
            setSyncedState(false, connection);
        } else {
            const otherContainer = prevContainers.filter(
                (prevContainer) =>
                    prevContainer.envelop.id !== container.envelop.id,
            );

            connection.db.conversations.set(
                conversationId,
                sortEnvelops([...otherContainer, container]),
            );
            setSyncedState(false, connection);
        }
    }
}

export function sync(connection: Connection): {
    version: string;
    payload: EthEncryptedData;
} {
    setSyncedState(true, connection);

    if (!connection.db.keys?.publicKey) {
        throw Error('No key to encrypt');
    }

    const payload = encryptSafely({
        publicKey: connection.db.keys?.publicKey,
        data: JSON.stringify({
            conversations: JSON.stringify(
                connection.db.conversations,
                replacer,
            ),
            keys: connection.db.keys,
        }),
        version: 'x25519-xsalsa20-poly1305',
    });

    return {
        version: 'ens-mail-encryption-1',
        payload,
    };
}

export async function load(
    connection: Connection,
    data: {
        version: string;
        payload: EthEncryptedData;
    },
): Promise<PublicKeys> {
    const decryptedPayload: { conversations: string; keys: Keys } = JSON.parse(
        JSON.parse(
            await decryptUsingProvider(
                connection.provider,
                ethers.utils.hexlify(
                    ethers.utils.toUtf8Bytes(JSON.stringify(data.payload)),
                ),

                connection.account.address,
            ),
        ).data,
    );

    connection.db.conversations = JSON.parse(
        decryptedPayload.conversations,
        reviver,
    );

    connection.db.keys = decryptedPayload.keys;

    setSyncedState(true, connection);
    return {
        publicKey: decryptedPayload.keys.publicKey,
        publicMessagingKey: decryptedPayload.keys.publicMessagingKey,
        publicSigningKey: decryptedPayload.keys.publicSigningKey,
    };
}

export function getConversationId(accountA: string, accountB: string): string {
    return [formatAddress(accountA), formatAddress(accountB)].sort().join();
}

export function createEmptyConversation(
    connection: Connection,
    accountAddress: string,
): boolean {
    const conversationId = getConversationId(
        connection.account.address,
        accountAddress,
    );
    const isNewConversation = !connection.db.conversations.has(conversationId);
    if (isNewConversation) {
        connection.db.conversations.set(conversationId, []);
    }

    return isNewConversation;
}
