import { syncAcknoledgment } from 'dm3-lib-delivery-api';
import { getAccountDisplayName, getBrowserStorageKey } from 'dm3-lib-profile';
import { log } from 'dm3-lib-shared';
import {
    SyncProcessState,
    StorageLocation,
    sync as syncStorage,
    googleStore,
    UserDB,
    web3Store,
    useDm3Storage,
} from 'dm3-lib-storage';
import localforage from 'localforage';
import { useContext, useEffect } from 'react';
import { GlobalContext } from '../../utils/context-utils';
import { UserDbType } from '../../utils/enum-type-utils';

export default function Storage() {
    const { state, dispatch } = useContext(GlobalContext);

    const sync = async (event?: any) => {
        if (event) {
            event.preventDefault();
        }

        dispatch({
            type: UserDbType.setSyncProcessState,
            payload: SyncProcessState.Running,
        });

        try {
            let acknowledgements = [];

            switch (state.connection.storageLocation) {
                case StorageLocation.GoogleDrive:
                    acknowledgements = await googleStore(
                        (window as any).gapi,
                        state.userDb as UserDB,
                        state.auth.currentSession?.token!,
                    );
                    break;

                case StorageLocation.Web3Storage:
                    acknowledgements = await web3Store(
                        state.connection.storageToken!,
                        state.userDb as UserDB,
                        state.auth.currentSession?.token!,
                    );
                    break;

                case StorageLocation.dm3Storage:
                    acknowledgements = await useDm3Storage(
                        state.connection.provider!,
                        state.connection.account!,
                        state.userDb as UserDB,
                        state.auth.currentSession?.token!,
                    );
                    break;

                case StorageLocation.File:

                default:
                    if (state.userDb) {
                        await useDm3Storage(
                            state.connection.provider!,
                            state.connection.account!,
                            state.userDb,
                            state.auth.currentSession?.token!,
                        );
                    }

                    const syncResult = await syncStorage(
                        state.userDb,
                        state.auth.currentSession?.token!,
                    );

                    acknowledgements = syncResult.acknoledgments;

                    const blob = new Blob(
                        [JSON.stringify(syncResult.userStorage)],
                        {
                            type: 'text/json',
                        },
                    );

                    const a = document.createElement('a');

                    a.download = `${getAccountDisplayName(
                        state.connection.account!.ensName,
                        35,
                        true,
                    )}-${Date.now()}.json`;

                    a.href = window.URL.createObjectURL(blob);

                    const clickEvt = new MouseEvent('click', {
                        view: window,
                        bubbles: true,
                        cancelable: true,
                    });

                    a.dispatchEvent(clickEvt);
                    a.remove();

                    break;
            }

            if (state.userDb && acknowledgements.length > 0) {
                await syncAcknoledgment(
                    state.connection.provider!,
                    state.connection.account!,
                    acknowledgements,
                    state.auth.currentSession?.token!,
                    state.uiState.lastMessagePull,
                );
            }

            dispatch({ type: UserDbType.setSynced, payload: true });
            dispatch({
                type: UserDbType.setSyncProcessState,
                payload: SyncProcessState.Idle,
            });
        } catch (e) {
            log('[sync] ' + JSON.stringify(e), 'error');
            dispatch({
                type: UserDbType.setSyncProcessState,
                payload: SyncProcessState.Failed,
            });
        }
    };

    const autoSync = () => {
        if (
            (state.connection.storageLocation === StorageLocation.Web3Storage ||
                state.connection.storageLocation ===
                    StorageLocation.dm3Storage ||
                state.connection.storageLocation ===
                    StorageLocation.GoogleDrive) &&
            state.userDb &&
            !state.userDb.synced
        ) {
            log(
                `[DB] Create user storage external snapshot at timestamp ${state.userDb?.lastChangeTimestamp}`,
                'info',
            );
            sync();
        }
    };

    useEffect(() => {
        const setBroserStorage = async () => {
            localforage.setItem(
                getBrowserStorageKey(state.connection.account!.ensName),
                (
                    await syncStorage(
                        state.userDb,
                        state.auth.currentSession?.token!,
                    )
                ).userStorage,
            );
        };
        if (state.uiState.browserStorageBackup) {
            log(
                `[DB/Browser] Create user storage browser snapshot at timestamp ${state.userDb?.lastChangeTimestamp}`,
                'info',
            );
            setBroserStorage();
        }
        autoSync();
    }, [state.userDb?.lastChangeTimestamp]);

    const showAlert =
        (!state.userDb?.synced &&
            state.connection.storageLocation === StorageLocation.File) ||
        state.userDb?.syncProcessState === SyncProcessState.Failed;

    if (state.connection.storageLocation !== StorageLocation.File) {
        return <></>;
    }

    return <></>;
}
