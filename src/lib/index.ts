import { ethers } from 'ethers';
import * as Web3Api from './external-apis/InjectedWeb3API';
import * as Web3Provider from './web3-provider/Web3Provider';
import * as SignIn from './signin';
import * as BackendAPI from './external-apis/BackendAPI';
import * as Messaging from './messaging/Messaging';
import * as Encryption from './encryption/Encryption';
import * as Account from './account/Account';
import * as Storage from './storage';
import { StorageEnvelopContainer, UserDB, UserStorage } from './storage';

export type { Connection } from './web3-provider/Web3Provider';
export type {
    Account,
    PublicKeys,
    Keys,
    ProfileRegistryEntry,
} from './account/Account';
export type {
    Message,
    EncryptionEnvelop,
    Envelop,
} from './messaging/Messaging';
export type { UserDB, StorageEnvelopContainer } from './storage';

export * as Delivery from './delivery';

export {
    createDB,
    getConversationId,
    sync,
    load,
    sortEnvelops,
    getConversation,
    StorageLocation,
    web3Store,
    web3Load,
    SyncProcessState,
    googleLoad,
    googleStore,
    createTimestamp,
} from './storage';
export {
    getAccountDisplayName,
    extractPublicKeys,
    getBrowserStorageKey,
} from './account/Account';
export { decryptEnvelop, checkSignature } from './encryption/Encryption';
export { MessageState } from './messaging/Messaging';
export { ConnectionState, getWeb3Provider } from './web3-provider/Web3Provider';
export { getNewMessages, syncAcknoledgment } from './external-apis/BackendAPI';
export { lookupAddress, formatAddress } from './external-apis/InjectedWeb3API';
export { log } from './shared/log';
export { getSessionToken } from './signin';

export function connectAccount(provider: ethers.providers.JsonRpcProvider) {
    return SignIn.connectAccount(
        provider,
        Web3Api.requestAccounts,
        BackendAPI.getProfileRegistryEntry,
    );
}

export async function addContact(
    connection: Web3Provider.Connection,
    accountInput: string,
    userDb: UserDB,
    createEmptyConversationEntry: (id: string) => void,
) {
    return Account.addContact(
        connection,
        accountInput,
        Web3Api.resolveName,
        userDb,
        createEmptyConversationEntry,
    );
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
    browserDataFile: UserStorage | undefined,
    externalDataFile: string | undefined,
): Promise<{
    connectionState: Web3Provider.ConnectionState;
    db?: Storage.UserDB;
}> {
    return SignIn.signIn(
        connection,
        Web3Api.prersonalSign,
        BackendAPI.submitProfileRegistryEntry,
        Account.createKeys,
        Web3Api.getPublicKey,
        browserDataFile,
        externalDataFile,
    );
}

export async function submitMessage(
    connection: Web3Provider.Connection,
    userDb: UserDB,
    to: Account.Account,
    message: Messaging.Message,
    haltDelivery: boolean,
    storeMessages: (envelops: StorageEnvelopContainer[]) => void,
    onSuccess?: (envelop: Messaging.Envelop) => void,
) {
    Messaging.submitMessage(
        connection,
        userDb,
        to,
        message,
        BackendAPI.submitMessage,
        Encryption.signWithEncryptionKey,
        Encryption.encryptSafely,
        BackendAPI.createPendingEntry,
        haltDelivery,
        storeMessages,
        onSuccess,
    );
}

export async function getMessages(
    connection: Web3Provider.Connection,
    contact: string,
    userDb: UserDB,
    storeMessages: (envelops: StorageEnvelopContainer[]) => void,
) {
    return Messaging.getMessages(
        connection,
        contact,
        BackendAPI.getNewMessages,
        storeMessages,
        userDb,
    );
}

export async function getContacts(
    connection: Web3Provider.Connection,
    userDb: UserDB,
    createEmptyConversationEntry: (id: string) => void,
) {
    return Account.getContacts(
        connection,
        BackendAPI.getProfileRegistryEntry,
        BackendAPI.getPendingConversations,
        Web3Api.resolveName,
        userDb,
        createEmptyConversationEntry,
    );
}
