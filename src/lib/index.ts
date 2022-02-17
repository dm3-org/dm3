import { ethers } from 'ethers';
import * as Web3Api from './external-apis/InjectedWeb3API';
import * as Web3Provider from './Web3Provider';
import * as SignIn from './SignIn';
import * as BackendAPI from './external-apis/BackendAPI';
import * as Messaging from './Messaging';
import * as Encryption from './Encryption';

export { decryptMessage, checkSignature } from './Encryption';
export { MessageState } from './Messaging';
export type { Message, EncryptionEnvelop, Envelop } from './Messaging';
export {
    ConnectionState,
    getAccountDisplayName,
    getWeb3Provider,
} from './Web3Provider';
export type { Account, ApiConnection, EncryptedKeys } from './Web3Provider';
export { getMessages, getContacts } from './external-apis/BackendAPI';
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
    apiConnection: Web3Provider.ApiConnection,
    to: Web3Provider.Account,
    message: Messaging.Message,
    encrypt?: boolean,
): Promise<void> {
    return Messaging.submitMessage(
        apiConnection,
        to,
        message,
        BackendAPI.submitMessage,
        Encryption.signWithEncryptionKey,
        Encryption.encryptSafely,
        encrypt,
    );
}

export async function addContact(
    apiConnection: Web3Provider.ApiConnection,
    input: string,
) {
    return Web3Provider.addContact(
        apiConnection,
        input,
        Web3Api.resolveName,
        BackendAPI.addContact,
    );
}
