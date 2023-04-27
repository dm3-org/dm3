import {
    StorageLocation,
    SyncProcessState,
    UserDB,
    googleStore,
    sync as syncStorage,
    useDm3Storage,
    web3Store,
} from 'dm3-lib-storage';
import localforage from 'localforage';
import { useContext, useEffect } from 'react';
import 'react-chat-widget/lib/styles.css';
import { GlobalContext } from '../GlobalContextProvider';
import { UserDbType } from '../reducers/UserDB';
import Icon from '../ui-shared/Icon';
import './Storage.css';
import { getAccountDisplayName, getBrowserStorageKey } from 'dm3-lib-profile';
import { syncAcknoledgment } from 'dm3-lib-delivery-api';
import { log } from 'dm3-lib-shared';

function StorageView() {
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
            let acknoledgments = [];

            switch (state.connection.storageLocation) {
                case StorageLocation.GoogleDrive:
                    acknoledgments = await googleStore(
                        (window as any).gapi,
                        state.userDb as UserDB,
                        state.auth.currentSession?.token!,
                    );
                    break;

                case StorageLocation.Web3Storage:
                    acknoledgments = await web3Store(
                        state.connection.storageToken!,
                        state.userDb as UserDB,
                        state.auth.currentSession?.token!,
                    );
                    break;

                case StorageLocation.dm3Storage:
                    acknoledgments = await useDm3Storage(
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
                    acknoledgments = syncResult.acknoledgments;
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

            if (state.userDb && acknoledgments.length > 0) {
                await syncAcknoledgment(
                    state.connection.provider!,
                    state.connection.account!,
                    acknoledgments,
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
            log(e as string);
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

    return state.uiState.maxLeftView ? (
        <div className="mt-auto w-100 ">
            <div
                className={`storage-view-container bottom-left-radius ${
                    showAlert ? ' not-synced' : ''
                }`}
            >
                <div className="storage-view text-center d-flex justify-content-start ">
                    <div>
                        <button
                            type="button"
                            onClick={() => {
                                log(
                                    `Manually create user storage external snapshot` +
                                        ` at timestamp ${state.userDb?.lastChangeTimestamp}`,
                                );
                                sync();
                            }}
                            className={`ms-1 me-3 btn btn-outline-secondary right-btn`}
                            disabled={
                                state.userDb?.syncProcessState ===
                                SyncProcessState.Running
                            }
                        >
                            {state.userDb?.syncProcessState ===
                            SyncProcessState.Running ? (
                                <span className="push-end">
                                    <Icon iconClass="fas fa-sync fa-spin" />
                                </span>
                            ) : (
                                <>
                                    {state.connection.storageLocation ===
                                    StorageLocation.File ? (
                                        <Icon
                                            iconClass={`fas fa-download ${
                                                state.userDb?.synced
                                                    ? ''
                                                    : 'fa-fade'
                                            }`}
                                        />
                                    ) : (
                                        <Icon iconClass="fas fa-sync" />
                                    )}
                                </>
                            )}
                        </button>
                    </div>
                    <div className="text-muted d-flex">
                        <div className="align-self-center sync-state">
                            {state.userDb?.synced ? (
                                <>
                                    Last sync:{' '}
                                    {new Date(
                                        state.userDb!.lastChangeTimestamp,
                                    ).toLocaleString()}
                                </>
                            ) : (
                                <>Not in sync with storage</>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    ) : (
        <></>
    );
}

export default StorageView;
