import { ethers } from 'ethers';
import * as Web3Api from './external-apis/InjectedWeb3API';
import * as Web3Provider from './Web3Provider';
import * as SignIn from './SignIn';
import * as BackendAPI from './external-apis/BackendAPI';
import * as Messaging from './Messaging';
import * as Encryption from './Encryption';

export type { Account, Connection, EncryptedKeys } from './Web3Provider';
export type { Message, EncryptionEnvelop, Envelop } from './Messaging';
export type { MessageDB } from './Storage';

export { createDB, getConversationId } from './Storage';
export { decryptEnvelop, checkSignature } from './Encryption';
export {
    MessageState,
    isEncryptionEnvelop,
    getEnvelopMetaData,
} from './Messaging';
export {
    logConnectionChange,
    ConnectionState,
    getAccountDisplayName,
    getWeb3Provider,
} from './Web3Provider';
export { getContacts, getNewMessages } from './external-apis/BackendAPI';
export { lookupAddress, formatAddress } from './external-apis/InjectedWeb3API';
export { log } from './log';
export { getSessionToken } from './SignIn';

export function connectAccount(provider: ethers.providers.JsonRpcProvider) {
    return Web3Provider.connectAccount(provider, Web3Api.requestAccounts);
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
    provider: ethers.providers.JsonRpcProvider,
    account: string,
): Promise<{
    connectionState: Web3Provider.ConnectionState;
    sessionToken?: string;
    keys?: Web3Provider.Keys;
}> {
    return SignIn.signIn(
        provider,
        account,
        BackendAPI.requestChallenge,
        Web3Api.prersonalSign,
        BackendAPI.submitSignedChallenge,
        BackendAPI.getKeys,
        Web3Api.decrypt,
        BackendAPI.submitKeys,
        Web3Provider.submitEncryptedKeys,
        Web3Provider.createMessagingKeyPair,
        Web3Api.getPublicKey,
    );
}

export async function submitMessage(
    connection: Web3Provider.Connection,
    to: Web3Provider.Account,
    message: Messaging.Message,
    onSuccess: () => void,
    encrypt?: boolean,
): Promise<void> {
    return Messaging.submitMessage(
        connection,
        to,
        message,
        BackendAPI.submitMessage,
        Encryption.signWithEncryptionKey,
        Encryption.encryptSafely,
        onSuccess,
        encrypt,
    );
}

export async function addContact(
    connection: Web3Provider.Connection,
    input: string,
) {
    return Web3Provider.addContact(
        connection,
        input,
        Web3Api.resolveName,
        BackendAPI.addContact,
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
