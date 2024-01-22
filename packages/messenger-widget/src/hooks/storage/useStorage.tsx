//Hook to interact with the storage.
//Will be initialized with the deliveryServiceToken and the initialUserDb after the user has logged in.

import {
    UserDB,
    createTimestamp,
    sync as getAcknoledgements,
} from '@dm3-org/dm3-lib-storage';
import { syncAcknoledgment } from '@dm3-org/dm3-lib-delivery-api';

import { useContext, useEffect, useMemo, useState } from 'react';
import { useMainnetProvider } from '../mainnetprovider/useMainnetProvider';
import { AuthContext } from '../../context/AuthContext';
import { log } from '@dm3-org/dm3-lib-shared';
import { Account } from '@dm3-org/dm3-lib-profile';

export declare enum SyncProcessState {
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
) => {
    const [syncProcessState, setSyncProcessState] = useState<SyncProcessState>(
        SyncProcessState.Uninitialized,
    );

    //Not sure if its needed; however since its part of older lib functions if have included it.
    // Might be subject of removal
    const [lastMessagePull, setLastMessagePull] = useState<number>(0);

    const [userDb, setUserDb] = useState<UserDB | undefined>(undefined);

    const mainnetProvider = useMainnetProvider();

    useEffect(() => {
        //Called to initialize the storage
        if (!deliveryServiceToken || !_initialUserDb) {
            return;
        }
        setUserDb(_initialUserDb);
        _sync();
    }, [_initialUserDb, deliveryServiceToken]);

    const _sync = async () => {
        if (!deliveryServiceToken || !userDb || !account) {
            log('[sync] not logged in yet', 'info');
            return;
        }

        const syncTime = createTimestamp();
        //Write current storage object to the delivery service
        //Acknowledgements the delivery service that the storage has been written are beeing returned
        const { acknoledgments } = await getAcknoledgements(
            userDb,
            deliveryServiceToken,
        );
        syncAcknoledgment(
            mainnetProvider,
            account,
            acknoledgments,
            deliveryServiceToken,
            lastMessagePull,
        );

        //Sync has been completed
        setSyncProcessState(SyncProcessState.Idle);
    };

    const addMessage = async (message: any) => {};
    return {
        syncProcessState,
        addMessage,
        userDb,
    };
};
