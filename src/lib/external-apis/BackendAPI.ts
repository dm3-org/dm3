import axios from 'axios';
import { log } from '../shared/log';
import { EncryptionEnvelop, Envelop } from '../messaging/Messaging';
import { Connection } from '../web3-provider/Web3Provider';
import { PublicKeys } from '../account/Account';
import { UserDB } from '..';

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
    userDb: UserDB,
    envelop: Envelop | EncryptionEnvelop,
    onSuccess: () => void,
    onError: () => void,
): Promise<void> {
    if (connection.socket) {
        connection.socket.emit(
            'submitMessage',
            {
                envelop,
                token: userDb.deliveryServiceToken,
            },
            (response: string) => {
                if (response === 'success') {
                    log(`- success`);
                    onSuccess();
                } else {
                    log(`- error`);
                    onError();
                }
            },
        );
    }
}

export async function createPendingEntry(
    connection: Connection,
    userDb: UserDB,
    accountAddress: string,
    contactAddress: string,
): Promise<void> {
    if (connection.socket) {
        log(`Create pending entry`);
        connection.socket.emit('pendingMessage', {
            accountAddress,
            contactAddress,
            token: userDb.deliveryServiceToken,
        });
    }
}

export async function getNewMessages(
    connection: Connection,
    userDb: UserDB,
    contactAddress: string,
): Promise<EncryptionEnvelop[]> {
    return (
        await axios.post(
            DELIVERY_SERVICE,
            createJsonRpcRequest('getMessages', {
                accountAddress: connection.account!.address,
                contactAddress,
                token: userDb.deliveryServiceToken,
            }),
        )
    ).data.result.messages;
}

export async function getPendingConversations(
    connection: Connection,
    userDb: UserDB,
): Promise<string[]> {
    return (
        await axios.post(
            DELIVERY_SERVICE,
            createJsonRpcRequest('getPendingConversations', {
                accountAddress: connection.account!.address,
                token: userDb.deliveryServiceToken,
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
