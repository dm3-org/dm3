import axios from 'axios';
import { log } from '../lib/log';
import { Envelop, Message } from '../lib/Messaging';
import { ApiConnection } from '../lib/Web3Provider';

export async function submitSignedChallenge(
    challenge: string,
    signature: string,
) {
    await axios.post(
        (process.env.REACT_APP_BACKEND as string) + '/submitSignedChallenge',
        { challenge, signature },
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
        ((process.env.REACT_APP_BACKEND as string) +
            '/addContact/' +
            apiConnection.account) as string,
        { contactAddress, token: apiConnection.sessionToken },
    );
}

export async function getContacts(
    account: string,
    token: string,
): Promise<string[]> {
    return (
        await axios.post(
            (process.env.REACT_APP_BACKEND as string) +
                '/getContacts/' +
                account,
            { token },
        )
    ).data.contacts;
}

export async function submitMessage(
    apiConnection: ApiConnection,
    envelop: Envelop,
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
            ((process.env.REACT_APP_BACKEND as string) +
                '/getMessages/' +
                apiConnection.account) as string,
            { contact, token: apiConnection.sessionToken },
        )
    ).data.messages;
}
