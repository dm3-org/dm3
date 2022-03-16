import axios from 'axios';
import { log } from '../log';
import { EncryptionEnvelop, Envelop } from '../Messaging';
import { Connection } from '../Web3Provider';
import { PublicKeys } from '../Account';

const DELIVERY_SERVICE =
    (process.env.REACT_APP_BACKEND as string) + '/deliveryService';

function createJsonRpcRequest(method: string, params: any, id = 1) {
    return {
        jsonrpc: '2.0',
        method,
        params,
        id,
    };
}

export async function submitSignedChallenge(
    challenge: string,
    signature: string,
) {
    return (
        await axios.post(
            DELIVERY_SERVICE,
            createJsonRpcRequest('submitSignedChallenge', {
                challenge,
                signature,
            }),
        )
    ).data.result;
}

export async function submitPublicKeys(
    accountAddress: string,
    publicKeys: PublicKeys,
    token: string,
): Promise<void> {
    await axios.post(
        DELIVERY_SERVICE,
        createJsonRpcRequest('submitPublicKeys', {
            accountAddress: accountAddress,
            publicKeys,
            token: token,
        }),
    );
}

export async function requestChallenge(
    account: string,
): Promise<{ challenge: string; hasKeys: boolean }> {
    return (
        await axios.post(
            DELIVERY_SERVICE,
            createJsonRpcRequest('requestSignInChallenge', {
                accountAddress: account,
            }),
        )
    ).data.result;
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
    contactAddress: string,
): Promise<Envelop[]> {
    return (
        await axios.post(
            DELIVERY_SERVICE,
            createJsonRpcRequest('getMessages', {
                accountAddress: connection.account.address,
                contactAddress,
                token: connection.sessionToken,
            }),
        )
    ).data.result.messages;
}

export async function getPendingConversations(
    connection: Connection,
): Promise<string[]> {
    return (
        await axios.post(
            DELIVERY_SERVICE,
            createJsonRpcRequest('getPendingConversations', {
                accountAddress: connection.account.address,
                token: connection.sessionToken,
            }),
        )
    ).data.result.pendingConversations;
}

export async function getPublicKeys(
    contact: string,
): Promise<PublicKeys | undefined> {
    return (
        await axios.post(
            DELIVERY_SERVICE,
            createJsonRpcRequest('getPublicKeys', {
                accountAddress: contact,
            }),
        )
    ).data.result;
}
