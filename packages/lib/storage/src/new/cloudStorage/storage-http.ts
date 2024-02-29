import { normalizeEnsName } from '@dm3-org/dm3-lib-profile';
import axios from 'axios';
import { MessageRecord } from '../..';

const STORAGE_PATH = '/storage/new';
export function withAuthHeader(token: string) {
    return {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    };
}

export async function addConversation(
    storageUrl: string,
    storageToken: string,
    ensName: string,
    encryptedContactName: string,
): Promise<void> {
    const url = `${STORAGE_PATH}/${normalizeEnsName(ensName)}/addConversation`;

    await axios.post(
        `${storageUrl}${url}`,
        {
            encryptedContactName,
        },
        withAuthHeader(storageToken),
    );
}

export async function getConversations(
    storageUrl: string,
    storageToken: string,
    ensName: string,
): Promise<string[]> {
    const url = `${STORAGE_PATH}/${normalizeEnsName(ensName)}/getConversations`;

    const { data } = await axios.get(
        `${storageUrl}${url}`,
        withAuthHeader(storageToken),
    );

    return data ?? '';
}
export async function toggleHideConversation(
    storageUrl: string,
    storageToken: string,
    ensName: string,
    encryptedContactName: string,
    hide: boolean,
): Promise<void> {
    const url = `${STORAGE_PATH}/${normalizeEnsName(
        ensName,
    )}/toggleHideConversation`;

    await axios.post(
        `${storageUrl}${url}`,
        {
            encryptedContactName,
            hide,
        },
        withAuthHeader(storageToken),
    );
}

export function getMessagesFromStorage(
    storageUrl: string,
    storageToken: string,
    ensName: string,
    encryptedContactName: string,
    page: number,
): Promise<MessageRecord[]> {
    const url = `${STORAGE_PATH}/${normalizeEnsName(
        ensName,
    )}/getMessages/${encryptedContactName}/${page}`;

    return axios.get(`${storageUrl}${url}`, withAuthHeader(storageToken));
}

export function addMessage(
    storageUrl: string,
    storageToken: string,
    ensName: string,
    encryptedContactName: string,
    messageId: string,
    encryptedEnvelopContainer: string,
): Promise<void> {
    const url = `${STORAGE_PATH}/${normalizeEnsName(ensName)}/addMessage`;
    return axios.post(
        `${storageUrl}${url}`,
        {
            encryptedContactName,
            messageId,
            encryptedEnvelopContainer,
        },
        withAuthHeader(storageToken),
    );
}

export function addMessageBatch(
    storageUrl: string,
    storageToken: string,
    ensName: string,
    encryptedContactName: string,
    messageBatch: MessageRecord[],
): Promise<void> {
    const url = `${STORAGE_PATH}/${normalizeEnsName(ensName)}/addMessageBatch`;
    return axios.post(
        `${storageUrl}${url}`,
        {
            encryptedContactName,
            messageBatch,
        },
        withAuthHeader(storageToken),
    );
}

export async function editMessageBatch(
    storageUrl: string,
    storageToken: string,
    ensName: string,
    encryptedContactName: string,
    editMessageBatchPayload: MessageRecord[],
): Promise<void> {
    const url = `${STORAGE_PATH}/${normalizeEnsName(ensName)}/editMessageBatch`;
    const { status } = await axios.post(
        `${storageUrl}${url}`,
        {
            encryptedContactName,
            editMessageBatchPayload,
        },
        withAuthHeader(storageToken),
    );

    if (status !== 200) {
        throw Error('Unable to edit message batch');
    }
}

export async function getNumberOfMessages(
    storageUrl: string,
    storageToken: string,
    ensName: string,
    encryptedContactName: string,
): Promise<number> {
    const url = `${STORAGE_PATH}/${normalizeEnsName(
        ensName,
    )}/getNumberOfMessages/${encryptedContactName}`;

    const { data } = await axios.get(
        `${storageUrl}${url}`,
        withAuthHeader(storageToken),
    );

    return data;
}
export async function getNumberOfConversations(
    storageUrl: string,
    storageToken: string,
    ensName: string,
): Promise<number> {
    const url = `${STORAGE_PATH}/${normalizeEnsName(
        ensName,
    )}/getNumberOfConversations/`;

    const { data } = await axios.get(
        `${storageUrl}${url}`,
        withAuthHeader(storageToken),
    );

    return data;
}
