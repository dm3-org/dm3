/* eslint-disable no-console */
/* eslint-disable max-len */
//Hook to interact with the storage.
//Will be initialized with the deliveryServiceToken and the initialUserDb after the user has logged in.

import {
    UserDB,
    createTimestamp,
    sync as getAcknoledgements,
    createStorage,
    createRemoteKeyValueStoreApi,
} from '@dm3-org/dm3-lib-storage';
import {
    syncAcknoledgment,
    setStorageChunk,
    getStorageChunk,
} from '@dm3-org/dm3-lib-delivery-api';

import { useContext, useEffect, useMemo, useState } from 'react';
import { useMainnetProvider } from '../mainnetprovider/useMainnetProvider';
import { AuthContext } from '../../context/AuthContext';
import { log, stringify } from '@dm3-org/dm3-lib-shared';
import { Account, ProfileKeys } from '@dm3-org/dm3-lib-profile';
import {
    EncryptedPayload,
    decryptAsymmetric,
    encryptAsymmetric,
    sign,
} from '@dm3-org/dm3-lib-crypto';
import { Chunk, StorageAPI } from '@dm3-org/dm3-lib-storage/dist/new/types';
import { Message } from '@dm3-org/dm3-lib-messaging';

export enum SyncProcessState {
    Uninitialized = 'UNINITIALIZED',
    Idle = 'IDLE',
    Running = 'RUNNING',
    Failed = 'FAILED',
}

//Handels storage sync and offers an interface for other hooks to interact with the storage
export const useStorage = (
    account: Account | undefined,
    _initialUserDb: UserDB | undefined,
    deliveryServiceToken: string | undefined,
    profileKeys: ProfileKeys | undefined,
) => {
    const [syncProcessState, setSyncProcessState] = useState<SyncProcessState>(
        SyncProcessState.Uninitialized,
    );

    //Not sure if its needed; however since its part of older lib functions if have included it.
    // Might be subject of removal
    const [lastMessagePull, setLastMessagePull] = useState<number>(0);
    const [userDb, setUserDb] = useState<UserDB | undefined>(undefined);
    const mainnetProvider = useMainnetProvider();

    const [storageApi, setStorageApi] = useState<StorageAPI | undefined>(
        undefined,
    );

    useEffect(() => {
        //Called to initialize the storage
        if (!deliveryServiceToken) {
            return;
        }
        init();
        // setUserDb(_initialUserDb);
        // _sync();
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
            const preEncryptedPayload = stringify(encryptedPayload);
            return preEncryptedPayload;
        };
        const decrypt = async (data: string) => {
            const payload: EncryptedPayload = JSON.parse(
                data,
            ) as EncryptedPayload;
            const decrypted = await decryptAsymmetric(
                profileKeys?.encryptionKeyPair!,
                payload,
            );
            return JSON.parse(decrypted) as string;
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
        const count = await s!.getNumberOfConverations();
        console.log('number of conversations', count);
        const messages = await s!.getMessages('help.dm3.eth', 0);
        console.log('messages', messages);
    };

    const storeMessage = async (message: any) => {
        console.log('storeMessage', storageApi);
        const msg: Message = {
            attachments: [],
            message: 'lplp',
            metadata: {
                from: '0x99C19AB10b9EC8aC6fcda9586E81f6B73a298870.addr.dm3.eth',
                timestamp: 1706084571962,
                to: 'help.dm3.eth',
                type: 'NEW',
            },
            signature:
                'LzwsANn9OcBO2m0tg/iQvgJi28ILJeEONG+gXiw9PWsNV/IavpIMBshb+fbgxaOn9rwDbjn9UMGtczQLJZQ7Bw==',
        };

        console.log('start adding conversation');
        await storageApi!.addConversation('help.dm3.eth');

        console.log('adding conversation done');

        await storageApi!.addMessage('help.dm3.eth', {
            message: msg,
        });
        console.log('storeMessage done');
    };

    return {
        syncProcessState,
        storeMessage,
        userDb,
    };
};
