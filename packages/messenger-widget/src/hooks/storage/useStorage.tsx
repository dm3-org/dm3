/* eslint-disable no-console */
/* eslint-disable max-len */
//Hook to interact with the storage.
//Will be initialized with the deliveryServiceToken and the initialUserDb after the user has logged in.

import {
    UserDB,
    createRemoteKeyValueStoreApi,
    createStorage,
} from '@dm3-org/dm3-lib-storage';

import {
    EncryptedPayload,
    decryptAsymmetric,
    encryptAsymmetric,
    sign,
} from '@dm3-org/dm3-lib-crypto';
import { Account, ProfileKeys } from '@dm3-org/dm3-lib-profile';
import { stringify } from '@dm3-org/dm3-lib-shared';
import { StorageAPI } from '@dm3-org/dm3-lib-storage/dist/new/types';
import { useEffect, useMemo, useState } from 'react';
import { useMainnetProvider } from '../mainnetprovider/useMainnetProvider';
import { Envelop } from '@dm3-org/dm3-lib-messaging';

//Handels storage sync and offers an interface for other hooks to interact with the storage
export const useStorage = (
    account: Account | undefined,
    _initialUserDb: UserDB | undefined,
    deliveryServiceToken: string | undefined,
    profileKeys: ProfileKeys | undefined,
) => {
    const mainnetProvider = useMainnetProvider();

    const [storageApi, setStorageApi] = useState<StorageAPI | undefined>(
        undefined,
    );

    const initialized = useMemo(() => {
        return !!storageApi;
    }, [storageApi]);

    useEffect(() => {
        //Called to initialize the storage
        if (!deliveryServiceToken) {
            return;
        }
        init();
    }, [_initialUserDb, deliveryServiceToken]);

    const init = async () => {
        const signWithProfileKey = (data: string) => {
            return sign(profileKeys?.signingKeyPair?.privateKey!, data);
        };
        const encrypt = async (data: string) => {
            const encryptedPayload: EncryptedPayload = await encryptAsymmetric(
                profileKeys?.encryptionKeyPair?.publicKey!,
                data,
            );
            return stringify(encryptedPayload);
        };
        const decrypt = async (data: string) => {
            const payload: EncryptedPayload = JSON.parse(
                data,
            ) as EncryptedPayload;

            return await decryptAsymmetric(
                profileKeys?.encryptionKeyPair!,
                payload,
            );
        };

        const s = await createStorage(account?.ensName!, signWithProfileKey, {
            encryption: {
                encrypt: encrypt,
                decrypt: decrypt,
            },
            keyValueStoreRemote: createRemoteKeyValueStoreApi(
                account!,
                mainnetProvider!,
                deliveryServiceToken!,
                {
                    encrypt,
                    decrypt,
                },
            ),
        });

        setStorageApi(s);
    };

    const storeMessageAsync = (message: any) => {
        console.log('storeMessage', storageApi);
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

    return {
        storeMessageAsync,
        getConversations,
        addConversationAsync,
        getMessages,
        getNumberOfMessages,
        initialized,
    };
};

export type StoreMessageAsync = (message: any) => void;
export type GetConversations = (page: number) => Promise<string[]>;
export type AddConversation = (contact: string) => void;
export type GetMessages = (contact: string, page: number) => Promise<Envelop[]>;
export type GetNumberOfMessages = (contact: string) => Promise<number>;
