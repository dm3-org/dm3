import {
    StorageEnvelopContainer as StorageEnvelopContainerNew,
    getCloudStorage,
} from '@dm3-org/dm3-lib-storage';

import {
    EncryptedPayload,
    decryptAsymmetric,
    encryptAsymmetric,
    sign,
} from '@dm3-org/dm3-lib-crypto';
import { Account, ProfileKeys } from '@dm3-org/dm3-lib-profile';
import { stringify } from '@dm3-org/dm3-lib-shared';
import {
    Conversation,
    StorageAPI,
} from '@dm3-org/dm3-lib-storage/dist/new/types';
import { useEffect, useState } from 'react';
import { useMainnetProvider } from '../mainnetprovider/useMainnetProvider';

//Handels storage sync and offers an interface for other hooks to interact with the storage
export const useStorage = (
    account: Account | undefined,
    storageServiceUrl: string,
    storageServiceToken: string | undefined,
    profileKeys: ProfileKeys | undefined,
) => {
    const mainnetProvider = useMainnetProvider();

    const [storageApi, setStorageApi] = useState<StorageAPI | undefined>(
        undefined,
    );

    const [initialized, setInitialized] = useState<boolean>(false);

    useEffect(() => {
        setInitialized(false);
        setStorageApi(undefined);
        if (!storageServiceToken) {
            return;
        }
        init();
    }, [storageServiceToken, account]);

    const init = () => {
        const signWithProfileKey = (data: string) => {
            return sign(profileKeys?.signingKeyPair?.privateKey!, data);
        };
        const encrypt = async (data: string) => {
            const encryptedPayload: EncryptedPayload = await encryptAsymmetric(
                profileKeys?.encryptionKeyPair?.publicKey!,
                data,
            );
            return btoa(stringify(encryptedPayload));
        };
        const decrypt = async (data: string) => {
            const payload: EncryptedPayload = JSON.parse(
                atob(data),
            ) as EncryptedPayload;

            return await decryptAsymmetric(
                profileKeys?.encryptionKeyPair!,
                payload,
            );
        };

        const s = getCloudStorage(
            storageServiceUrl,
            storageServiceToken!,
            account!.ensName,
            {
                encrypt,
                decrypt,
            },
        );

        setStorageApi(s);
        setInitialized(true);
    };

    const editMessageBatchAsync = (
        contact: string,
        batch: StorageEnvelopContainerNew[],
    ) => {
        if (!storageApi) {
            throw Error('Storage not initialized');
        }
        //Because the straoge cannot handle concurrency properly we need to catch the error and retry if the message is not yet synced
        storageApi.editMessageBatch(contact, batch).catch((e) => {
            console.log('message not sync yet');
        });
    };

    const storeMessageAsync = (
        contact: string,
        envelop: StorageEnvelopContainerNew,
    ) => {
        if (!storageApi) {
            throw Error('Storage not initialized');
        }
        console.log('storeMessageAsync', contact, envelop);
        storageApi.addMessage(contact, envelop);
    };
    const storeMessageBatch = async (
        contact: string,
        batch: StorageEnvelopContainerNew[],
    ) => {
        if (!storageApi) {
            throw Error('Storage not initialized');
        }
        console.log('storeMessageAsync', contact, batch);
        await storageApi.addMessageBatch(contact, batch);
    };
    const getConversations = async (page: number) => {
        if (!storageApi) {
            return Promise.resolve([]);
        }
        return storageApi.getConversationList(page);
    };

    const addConversationAsync = (contact: string) => {
        if (!storageApi) {
            throw Error('Storage not initialized');
        }
        storageApi.addConversation(contact);
    };
    const getMessages = async (contact: string, page: number) => {
        if (!storageApi) {
            return Promise.resolve([]);
        }
        return storageApi.getMessages(contact, page);
    };

    const getNumberOfMessages = async (contact: string) => {
        if (!storageApi) {
            return Promise.resolve(0);
        }
        return storageApi.getNumberOfMessages(contact);
    };

    const toggleHideContactAsync = (contact: string, value: boolean) => {
        if (!storageApi) {
            return Promise.resolve(0);
        }
        storageApi.toggleHideConversation(contact, value);
    };

    return {
        storeMessageAsync,
        storeMessageBatch,
        editMessageBatchAsync,
        getConversations,
        addConversationAsync,
        getMessages,
        getNumberOfMessages,
        toggleHideContactAsync,
        initialized,
    };
};

export type StoreMessageAsync = (
    contact: string,
    envelop: StorageEnvelopContainerNew,
) => void;
export type editMessageBatchAsync = (
    contact: string,
    batch: StorageEnvelopContainerNew[],
) => void;
export type StoreMessageBatch = (
    contact: string,
    batch: StorageEnvelopContainerNew[],
) => Promise<void>;
export type GetConversations = (page: number) => Promise<Conversation[]>;
export type AddConversation = (contact: string) => void;
export type GetMessages = (
    contact: string,
    page: number,
) => Promise<StorageEnvelopContainerNew[]>;
export type GetNumberOfMessages = (contact: string) => Promise<number>;
export type ToggleHideContactAsync = (contact: string, value: boolean) => void;
