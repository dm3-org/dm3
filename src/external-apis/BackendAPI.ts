import axios from 'axios';
import { log } from '../lib/log';
import { EncryptionEnvelop, Envelop, Message } from '../lib/Messaging';
import { ApiConnection, Account, Keys } from '../lib/Web3Provider';

export async function submitSignedChallenge(
    challenge: string,
    signature: string,
) {
    await axios.post(
        (process.env.REACT_APP_BACKEND as string) + '/submitSignedChallenge',
        { challenge, signature },
    );
}

export async function submitKeys(
    apiConnection: ApiConnection,
    encryptedKeys: Keys,
): Promise<void> {
    await axios.post(
        (process.env.REACT_APP_BACKEND as string) +
            '/submitKeys/' +
            (apiConnection.account as Account).address,
        { keys: encryptedKeys, token: apiConnection.sessionToken },
    );
}

export async function requestChallenge(account: string): Promise<string> {
    return (
        await axios.post(
            (process.env.REACT_APP_BACKEND as string) +
                '/requestSignInChallenge',
            { account },
        )
    ).data.challenge;
}

export async function addContact(
    apiConnection: ApiConnection,
    contactAddress: string,
): Promise<void> {
    await axios.post(
        (process.env.REACT_APP_BACKEND as string) +
            '/addContact/' +
            (apiConnection.account as Account).address,
        { contactAddress, token: apiConnection.sessionToken },
    );
}

export async function getContacts(
    account: string,
    token: string,
): Promise<Account[]> {
    return (
        await axios.post(
            (process.env.REACT_APP_BACKEND as string) +
                '/getContacts/' +
                account,
            { token },
        )
    ).data;
}

export async function submitMessage(
    apiConnection: ApiConnection,
    envelop: Envelop | EncryptionEnvelop,
): Promise<void> {
    if (apiConnection.socket) {
        log(`Submitting message`);
        apiConnection.socket.emit('submitMessage', {
            envelop,
            token: apiConnection.sessionToken,
        });
    }
}

export async function getMessages(
    apiConnection: ApiConnection,
    contact: string,
): Promise<Envelop[]> {
    return (
        await axios.post(
            (process.env.REACT_APP_BACKEND as string) +
                '/getMessages/' +
                (apiConnection.account as Account).address,
            { contact, token: apiConnection.sessionToken },
        )
    ).data.messages;
}

export async function getPublicKey(
    contact: string,
): Promise<string | undefined> {
    return (
        await axios.get(
            (process.env.REACT_APP_BACKEND as string) + '/publicKey/' + contact,
        )
    ).data.publicKey;
}

export async function getKeys(
    accountAddress: string,
    sessionToken: string,
): Promise<Keys | undefined> {
    return (
        await axios.post(
            (process.env.REACT_APP_BACKEND as string) +
                '/getKeys/' +
                accountAddress,
            { token: sessionToken },
        )
    ).data.keys;
}
