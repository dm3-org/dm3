import axios from 'axios';
import { log } from '../log';
import { EncryptionEnvelop, Envelop } from '../Messaging';
import { Connection } from '../Web3Provider';
import { PublicKeys } from '../Account';

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
    accountAddress: string,
    keys: PublicKeys,
    token: string,
): Promise<void> {
    await axios.post(
        (process.env.REACT_APP_BACKEND as string) +
            '/submitKeys/' +
            accountAddress,
        { keys, token },
    );
}

export async function requestChallenge(
    account: string,
): Promise<{ challenge: string; hasKeys: boolean }> {
    return (
        await axios.post(
            (process.env.REACT_APP_BACKEND as string) +
                '/requestSignInChallenge',
            { account },
        )
    ).data;
}

export async function submitMessage(
    connection: Connection,
    envelop: Envelop | EncryptionEnvelop,
    onSuccess: () => void,
    onError: () => void,
): Promise<void> {
    if (connection.socket) {
        log(`Submitting message`);
        connection.socket.emit(
            'submitMessage',
            {
                envelop,
                token: connection.sessionToken,
            },
            (response: string) => {
                if (response === 'success') {
                    onSuccess();
                } else {
                    onError();
                }
            },
        );
    }
}

export async function getNewMessages(
    connection: Connection,
    contact: string,
): Promise<Envelop[]> {
    return (
        await axios.post(
            (process.env.REACT_APP_BACKEND as string) +
                '/getMessages/' +
                connection.account.address,
            { contact, token: connection.sessionToken },
        )
    ).data.messages;
}

export async function getPendingConversations(
    connection: Connection,
): Promise<string[]> {
    return (
        await axios.post(
            (process.env.REACT_APP_BACKEND as string) +
                '/getPendingConversations/' +
                connection.account.address,
            { token: connection.sessionToken },
        )
    ).data;
}

export async function getPublicKeys(
    contact: string,
): Promise<PublicKeys | undefined> {
    return (
        await axios.get(
            (process.env.REACT_APP_BACKEND as string) +
                '/getPublicKeys/' +
                contact,
        )
    ).data;
}

export async function getKeys(
    accountAddress: string,
    sessionToken: string,
): Promise<PublicKeys | undefined> {
    return (
        await axios.post(
            (process.env.REACT_APP_BACKEND as string) +
                '/getKeys/' +
                accountAddress,
            { token: sessionToken },
        )
    ).data.keys;
}
