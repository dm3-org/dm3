import { normalizeEnsName } from '@dm3-org/dm3-lib-profile';
import { MessageRecord, Conversation } from '@dm3-org/dm3-lib-storage';
import axios from 'axios';
import { getAxiosConfig } from './utils';

const STORAGE_PATH = '/storage/new';

export async function addConversation(
    storageUrl: string,
    storageToken: string,
    ensName: string,
    encryptedContactName: string,
): Promise<void> {
    const url = `${STORAGE_PATH}/new/${normalizeEnsName(
        ensName,
    )}/addConversation`;

    await axios.post(
        `${storageUrl}${url}`,
        {
            encryptedContactName,
        },
        getAxiosConfig(storageToken),
    );
}

export async function getConversations(
    storageUrl: string,
    storageToken: string,
    ensName: string,
): Promise<Conversation[]> {
    const url = `${STORAGE_PATH}/new/${normalizeEnsName(
        ensName,
    )}/getConversations`;

    const { data } = await axios.get(
        `${storageUrl}${url}`,
        getAxiosConfig(storageToken),
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
    const url = `${STORAGE_PATH}/new/${normalizeEnsName(
        ensName,
    )}/toggleHideConversation`;

    await axios.post(
        `${storageUrl}${url}`,
        {
            encryptedContactName,
            hide,
        },
        getAxiosConfig(storageToken),
    );
}

export function getMessagesFromStorage(
    storageUrl: string,
    storageToken: string,
    ensName: string,
    encryptedContactName: string,
    page: number,
): Promise<MessageRecord[]> {
    const url = `/new/${normalizeEnsName(
        ensName,
    )}/getMessages/${encryptedContactName}/${page}`;

    return axios.get(`${storageUrl}${url}`, getAxiosConfig(storageToken));
}

export function addMessage(
    storageUrl: string,
    storageToken: string,
    ensName: string,
    encryptedContactName: string,
    messageId: string,
    encryptedEnvelopContainer: string,
): Promise<void> {
    const url = `/new/${normalizeEnsName(ensName)}/addMessage`;
    return axios.post(
        `${storageUrl}${url}`,
        {
            encryptedContactName,
            messageId,
            encryptedEnvelopContainer,
        },
        getAxiosConfig(storageToken),
    );
}

export function addMessageBatch(
    storageUrl: string,
    storageToken: string,
    ensName: string,
    encryptedContactName: string,
    messageBatch: MessageRecord[],
): Promise<void> {
    const url = `/new/${normalizeEnsName(ensName)}/addMessageBatch`;
    return axios.post(
        `${storageUrl}${url}`,
        {
            encryptedContactName,
            messageBatch,
        },
        getAxiosConfig(storageToken),
    );
}

export async function editMessageBatch(
    storageUrl: string,
    storageToken: string,
    ensName: string,
    encryptedContactName: string,
    editMessageBatchPayload: MessageRecord[],
): Promise<void> {
    const url = `/new/${normalizeEnsName(ensName)}/editMessageBatch`;
    const { status } = await axios.post(
        `${storageUrl}${url}`,
        {
            encryptedContactName,
            editMessageBatchPayload,
        },
        getAxiosConfig(storageToken),
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
    const url = `/new/${normalizeEnsName(
        ensName,
    )}/getNumberOfMessages/${encryptedContactName}`;

    const { data } = await axios.get(
        `${storageUrl}${url}`,
        getAxiosConfig(storageToken),
    );

    return data;
}
export async function getNumberOfConversations(
    storageUrl: string,
    storageToken: string,
    ensName: string,
): Promise<number> {
    const url = `/new/${normalizeEnsName(ensName)}/getNumberOfConversations/`;

    const { data } = await axios.get(
        `${storageUrl}${url}`,
        getAxiosConfig(storageToken),
    );

    return data;
}
