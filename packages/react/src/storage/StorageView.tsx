import React, { useContext, useEffect, useState } from 'react';
import 'react-chat-widget/lib/styles.css';
import { GlobalContext } from '../GlobalContextProvider';
import * as Lib from 'dm3-lib';
import { UserDbType } from '../reducers/UserDB';
import Icon from '../ui-shared/Icon';
import './Storage.css';
import localforage from 'localforage';

function StorageView() {
    const { state, dispatch } = useContext(GlobalContext);
    const sync = async (event?: any) => {
        if (event) {
            event.preventDefault();
        }
        dispatch({
            type: UserDbType.setSyncProcessState,
            payload: Lib.storage.SyncProcessState.Running,
        });
        try {
            let acknoledgments = [];

            switch (state.connection.storageLocation) {
                case Lib.storage.StorageLocation.GoogleDrive:
                    acknoledgments = await Lib.storage.googleStore(
                        (window as any).gapi,
                        state.userDb as Lib.storage.UserDB,
                        state.auth.currentSession?.token!,
                    );
                    break;

                case Lib.storage.StorageLocation.Web3Storage:
                    acknoledgments = await Lib.storage.web3Store(
                        state.connection,
                        state.userDb as Lib.storage.UserDB,
                        state.auth.currentSession?.token!,
                    );
                    break;

                case Lib.storage.StorageLocation.dm3Storage:
                    acknoledgments = await Lib.storage.useDm3Storage(
                        state.connection,
                        state.userDb as Lib.storage.UserDB,
                        state.auth.currentSession?.token!,
                    );
                    break;

                case Lib.storage.StorageLocation.File:
                default:
                    if (state.userDb) {
                        await Lib.storage.useDm3Storage(
                            state.connection,
                            state.userDb,
                            state.auth.currentSession?.token!,
                        );
                    }
                    const syncResult = await Lib.storage.sync(
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
                    a.download = `${Lib.account.getAccountDisplayName(
                        state.connection.account!.ensName,
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
                await Lib.external.syncAcknoledgment(
                    state.connection,
                    acknoledgments,
                    state.auth.currentSession?.token!,
                    state.uiState.lastMessagePull,
                );
            }

            dispatch({ type: UserDbType.setSynced, payload: true });
            dispatch({
                type: UserDbType.setSyncProcessState,
                payload: Lib.storage.SyncProcessState.Idle,
            });
        } catch (e) {
            Lib.log(e as string);
            dispatch({
                type: UserDbType.setSyncProcessState,
                payload: Lib.storage.SyncProcessState.Failed,
            });
        }
    };

    // useEffect(() => {
    //     if (state.userDb && !state.userDb.synced) {
    //         sync();
    //     }
    // }, [state.userDb?.synced]);

    useEffect(() => {
        if (
            state.connection.storageLocation ===
                Lib.storage.StorageLocation.Web3Storage ||
            state.connection.storageLocation ===
                Lib.storage.StorageLocation.GoogleDrive ||
            state.connection.storageLocation ===
                Lib.storage.StorageLocation.dm3Storage
        ) {
            const autoSync = setInterval(() => {
                if (state.userDb && !state.userDb.synced) {
                    Lib.log(
                        `Auto create user storage external snapshot at timestamp ${state.userDb?.lastChangeTimestamp}`,
                    );
                    sync();
                }
            }, 500);
            return () => {
                clearInterval(autoSync);
            };
        }
    }, [state.connection.storageLocation, state.userDb, state.userDb?.synced]);

    const autoSync = () => {
        if (
            (state.connection.storageLocation ===
                Lib.storage.StorageLocation.Web3Storage ||
                state.connection.storageLocation ===
                    Lib.storage.StorageLocation.dm3Storage ||
                state.connection.storageLocation ===
                    Lib.storage.StorageLocation.GoogleDrive) &&
            state.userDb &&
            !state.userDb.synced
        ) {
            Lib.log(
                `[DB] Create user storage external snapshot at timestamp ${state.userDb?.lastChangeTimestamp}`,
            );
            sync();
        }
    };
    useEffect(autoSync, []);

    useEffect(() => {
        const setBroserStorage = async () => {
            localforage.setItem(
                Lib.account.getBrowserStorageKey(
                    state.connection.account!.ensName,
                ),
                (
                    await Lib.storage.sync(
                        state.userDb,
                        state.auth.currentSession?.token!,
                    )
                ).userStorage,
            );
        };
        if (state.uiState.browserStorageBackup) {
            Lib.log(
                `[DB/Browser] Create user storage browser snapshot at timestamp ${state.userDb?.lastChangeTimestamp}`,
            );
            setBroserStorage();
        }
        autoSync();
    }, [state.userDb?.lastChangeTimestamp]);

    const showAlert =
        (!state.userDb?.synced &&
            state.connection.storageLocation ===
                Lib.storage.StorageLocation.File) ||
        state.userDb?.syncProcessState === Lib.storage.SyncProcessState.Failed;

    if (state.connection.storageLocation !== Lib.storage.StorageLocation.File) {
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
                                Lib.log(
                                    `Manually create user storage external snapshot` +
                                        ` at timestamp ${state.userDb?.lastChangeTimestamp}`,
                                );
                                sync();
                            }}
                            className={`ms-1 me-3 btn btn-outline-secondary right-btn`}
                            disabled={
                                state.userDb?.syncProcessState ===
                                Lib.storage.SyncProcessState.Running
                            }
                        >
                            {state.userDb?.syncProcessState ===
                            Lib.storage.SyncProcessState.Running ? (
                                <span className="push-end">
                                    <Icon iconClass="fas fa-sync fa-spin" />
                                </span>
                            ) : (
                                <>
                                    {state.connection.storageLocation ===
                                    Lib.storage.StorageLocation.File ? (
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
