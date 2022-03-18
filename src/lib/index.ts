import { ethers } from 'ethers';
import * as Web3Api from './external-apis/InjectedWeb3API';
import * as Web3Provider from './Web3Provider';
import * as SignIn from './SignIn';
import * as BackendAPI from './external-apis/BackendAPI';
import * as Messaging from './Messaging';
import * as Encryption from './Encryption';
import * as Account from './Account';

export type { Connection } from './Web3Provider';
export type { Account, PublicKeys, Keys } from './Account';
export type { Message, EncryptionEnvelop, Envelop } from './Messaging';
export type { UserDB, StorageEnvelopContainer } from './Storage';

export * as Delivery from './delivery';

export {
    createDB,
    getConversationId,
    sync,
    load,
    storeMessages,
    getConversation,
} from './Storage';
export { getAccountDisplayName } from './Account';
export { decryptEnvelop, checkSignature } from './Encryption';
export { MessageState } from './Messaging';
export {
    logConnectionChange,
    ConnectionState,
    getWeb3Provider,
} from './Web3Provider';
export { getNewMessages } from './external-apis/BackendAPI';
export { lookupAddress, formatAddress } from './external-apis/InjectedWeb3API';
export { log } from './log';
export { getSessionToken } from './SignIn';

export function connectAccount(provider: ethers.providers.JsonRpcProvider) {
    return Web3Provider.connectAccount(provider, Web3Api.requestAccounts);
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
    dataFile?: string,
): Promise<{
    connectionState: Web3Provider.ConnectionState;
    sessionToken?: string;
    keys?: Account.PublicKeys;
}> {
    return SignIn.signIn(
        connection,
        BackendAPI.requestChallenge,
        Web3Api.prersonalSign,
        BackendAPI.submitSignedChallenge,
        BackendAPI.submitPublicKeys,
        Account.createMessagingKeyPair,
        Web3Api.getPublicKey,
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
    sessionToken: string,
) {
    return Account.getContacts(
        connection,
        sessionToken,
        BackendAPI.getPublicKeys,
        BackendAPI.getPendingConversations,
        Web3Api.resolveName,
    );
}
