import { ethers } from 'ethers';
import * as Web3Api from './external-apis/InjectedWeb3API';
import * as Web3Provider from './web3-provider/Web3Provider';
import * as SignIn from './signin';
import * as BackendAPI from './external-apis/BackendAPI';
import * as Messaging from './messaging/Messaging';
import * as Encryption from './encryption/Encryption';
import * as Account from './account/Account';
import * as Storage from './storage/Storage';

export type { Connection } from './web3-provider/Web3Provider';
export type { Account, PublicKeys, Keys } from './account/Account';
export type {
    Message,
    EncryptionEnvelop,
    Envelop,
} from './messaging/Messaging';
export type { UserDB, StorageEnvelopContainer } from './storage/Storage';

export * as Delivery from './delivery';

export {
    createDB,
    getConversationId,
    sync,
    load,
    storeMessages,
    getConversation,
} from './storage/Storage';
export { getAccountDisplayName, extractPublicKeys } from './account/Account';
export { decryptEnvelop, checkSignature } from './encryption/Encryption';
export { MessageState } from './messaging/Messaging';
export {
    logConnectionChange,
    ConnectionState,
    getWeb3Provider,
} from './web3-provider/Web3Provider';
export { getNewMessages } from './external-apis/BackendAPI';
export { lookupAddress, formatAddress } from './external-apis/InjectedWeb3API';
export { log } from './shared/log';
export { getSessionToken } from './signin';

export function connectAccount(provider: ethers.providers.JsonRpcProvider) {
    return SignIn.connectAccount(
        provider,
        Web3Api.requestAccounts,
        BackendAPI.getPublicKeys,
    );
}

export async function addContact(
    connection: Web3Provider.Connection,
    accountInput: string,
) {
    return Account.addContact(connection, accountInput, Web3Api.resolveName);
}

export function createMessage(
    to: string,
    from: string,
    message: string,
): Messaging.Message {
    return {
        to,
        from,
        timestamp: new Date().getTime(),
        message,
    };
}

export async function signIn(
    connection: Partial<Web3Provider.Connection>,
    syncNotifications: ((synced: boolean) => void)[],
    dataFile?: string,
): Promise<{
    connectionState: Web3Provider.ConnectionState;
    db?: Storage.UserDB;
}> {
    return SignIn.signIn(
        connection,
        BackendAPI.requestChallenge,
        Web3Api.prersonalSign,
        BackendAPI.submitSignedChallenge,
        BackendAPI.submitPublicKeys,
        Account.createMessagingKeyPair,
        Web3Api.getPublicKey,
        syncNotifications,
        dataFile,
    );
}

export async function submitMessage(
    connection: Web3Provider.Connection,
    to: Account.Account,
    message: Messaging.Message,
    haltDelivery: boolean,
    onSuccess?: (envelop: Messaging.Envelop) => void,
): Promise<void> {
    return Messaging.submitMessage(
        connection,
        to,
        message,
        BackendAPI.submitMessage,
        Encryption.signWithEncryptionKey,
        Encryption.encryptSafely,
        BackendAPI.createPendingEntry,
        haltDelivery,
        onSuccess,
    );
}

export async function getMessages(
    connection: Web3Provider.Connection,
    contact: string,
) {
    return Messaging.getMessages(
        connection,
        contact,
        BackendAPI.getNewMessages,
    );
}

export async function getContacts(
    connection: Web3Provider.Connection,
    deliveryServiceToken: string,
) {
    return Account.getContacts(
        connection,
        deliveryServiceToken,
        BackendAPI.getPublicKeys,
        BackendAPI.getPendingConversations,
        Web3Api.resolveName,
    );
}
