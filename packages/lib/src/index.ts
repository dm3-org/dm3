import * as Web3Api from './external-apis/InjectedWeb3API';
import * as Web3Provider from './web3-provider/Web3Provider';
import * as SignIn from './signin';
import * as BackendAPI from './external-apis/BackendAPI';
import * as Messaging from './messaging/Messaging';
import * as Encryption from './encryption/Encryption';
import * as SymmetricalEncryption from './encryption/SymmetricalEncryption';
import * as Account from './account/Account';
import * as Storage from './storage';

import { StorageEnvelopContainer, UserDB, UserStorage } from './storage';
import axios from 'axios';
import { signWithSignatureKey } from './encryption/Encryption';

export type { Connection } from './web3-provider/Web3Provider';
export type {
    Account,
    Keys,
    UserProfile,
    SignedUserProfile,
} from './account/Account';
export type {
    Message,
    EncryptionEnvelop,
    Envelop,
} from './messaging/Messaging';

export type { UserDB, StorageEnvelopContainer, UserStorage } from './storage';
export type { GetTransactions } from './external-apis/Etherscan';

export * as Delivery from './delivery';

export { getTransactions } from './external-apis/Etherscan';

export {
    createDB,
    getConversationId,
    sync,
    sortEnvelops,
    getConversation,
    StorageLocation,
    web3Store,
    web3Load,
    SyncProcessState,
    googleLoad,
    googleStore,
    createTimestamp,
    useDm3Storage,
    getDm3Storage,
} from './storage';
export {
    getAccountDisplayName,
    getBrowserStorageKey,
    checkStringSignature,
} from './account/Account';
export { decryptEnvelop, checkSignature } from './encryption/Encryption';
export { MessageState } from './messaging/Messaging';

export { getId } from './messaging/Utils';
export { ConnectionState, getWeb3Provider } from './web3-provider/Web3Provider';
export { getNewMessages, syncAcknoledgment } from './external-apis/BackendAPI';
export {
    lookupAddress,
    formatAddress,
    getDefaultEnsTextRecord,
    executeTransaction,
} from './external-apis/InjectedWeb3API';
export { log } from './shared/log';
export { getSessionToken } from './signin';

export function getUserProfile(
    connection: Web3Provider.Connection,
    contact: string,
    profileUrl?: string,
): Promise<Account.SignedUserProfile | undefined> {
    return Account.getUserProfile(
        connection,
        contact,
        BackendAPI.getUserProfileOffChain,
        Web3Api.getEnsTextRecord,
        async (uri) => (await axios.get(uri)).data,
        profileUrl,
    );
}

export type GetUserProfile = typeof getUserProfile;

export function connectAccount(
    connection: Web3Provider.Connection,
    preSetAccount?: string,
) {
    return SignIn.connectAccount(
        connection,
        Web3Api.requestAccounts,
        getUserProfile,
        preSetAccount,
    );
}

export function load(
    connection: Web3Provider.Connection,
    data: Storage.UserStorage,
    key?: string,
) {
    return Storage.load(
        connection,
        data,
        SymmetricalEncryption.getSymmetricalKeyFromSignature,
        Web3Api.prersonalSign,
        key,
    );
}

export function publishProfileOnchain(
    connection: Web3Provider.Connection,
    uri: string,
) {
    return Account.publishProfileOnchain(
        connection,
        uri,
        Web3Api.lookupAddress,
        Web3Api.getResolver,
        Web3Api.getConractInstance,
        BackendAPI.getUserProfileOffChain,
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
    userDb: UserDB,
): Messaging.Message {
    const messgeWithoutSig: Omit<Messaging.Message, 'signature'> = {
        to,
        from,
        timestamp: new Date().getTime(),
        message,
        type: 'NEW',
    };

    return {
        ...messgeWithoutSig,
        signature: signWithSignatureKey(
            messgeWithoutSig,
            userDb?.keys as Account.Keys,
        ),
    };
}

export async function signIn(
    connection: Partial<Web3Provider.Connection>,
    browserDataFile: UserStorage | undefined,
    externalDataFile: string | undefined,
    overwriteUserDb: Partial<UserDB>,
    preLoadedKey?: string,
): Promise<{
    connectionState: Web3Provider.ConnectionState;
    db?: Storage.UserDB;
}> {
    return SignIn.signIn(
        connection,
        Web3Api.prersonalSign,
        BackendAPI.submitUserProfile,
        Account.createKeys,
        SymmetricalEncryption.getSymmetricalKeyFromSignature,
        browserDataFile,
        externalDataFile,
        overwriteUserDb,
        preLoadedKey,
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
        Encryption.signWithSignatureKey,
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
        getUserProfile,
        BackendAPI.getPendingConversations,
        Web3Api.resolveName,
        userDb,
        createEmptyConversationEntry,
    );
}

export async function reAuth(connection: Web3Provider.Connection) {
    return SignIn.reAuth(
        connection,
        BackendAPI.getChallenge,
        BackendAPI.getNewToken,
        Web3Api.prersonalSign,
    );
}
