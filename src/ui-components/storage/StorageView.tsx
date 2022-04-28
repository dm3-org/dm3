import React, { useContext, useEffect, useState } from 'react';
import 'react-chat-widget/lib/styles.css';
import { GlobalContext } from '../GlobalContextProvider';
import * as Lib from '../../lib';
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
            payload: Lib.SyncProcessState.Running,
        });
        try {
            let acknoledgments = [];
            if (
                state.connection.storageLocation ===
                Lib.StorageLocation.GoogleDrive
            ) {
                acknoledgments = await Lib.googleStore(
                    (window as any).gapi,
                    state.userDb as Lib.UserDB,
                );
            } else if (
                state.connection.storageLocation ===
                Lib.StorageLocation.Web3Storage
            ) {
                acknoledgments = await Lib.web3Store(
                    state.connection,
                    state.userDb as Lib.UserDB,
                );
            } else {
                const syncResult = Lib.sync(state.userDb);
                acknoledgments = syncResult.acknoledgments;
                const blob = new Blob(
                    [JSON.stringify(syncResult.userStorage)],
                    {
                        type: 'text/json',
                    },
                );

                const a = document.createElement('a');
                a.download = `${Lib.getAccountDisplayName(
                    state.connection.account!.address,
                    state.cache.ensNames,
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
            }

            if (state.userDb && acknoledgments.length > 0) {
                await Lib.syncAcknoledgment(
                    state.connection,
                    acknoledgments,
                    state.userDb,
                );
            }

            dispatch({ type: UserDbType.setSynced, payload: true });
            dispatch({
                type: UserDbType.setSyncProcessState,
                payload: Lib.SyncProcessState.Idle,
            });
        } catch (e) {
            Lib.log(e as string);
            dispatch({
                type: UserDbType.setSyncProcessState,
                payload: Lib.SyncProcessState.Failed,
            });
        }
    };

    useEffect(() => {
        if (
            state.connection.storageLocation ===
                Lib.StorageLocation.Web3Storage ||
            state.connection.storageLocation === Lib.StorageLocation.GoogleDrive
        ) {
            const autoSync = setInterval(() => {
                if (state.userDb && !state.userDb.synced) {
                    Lib.log(
                        `Auto create user storage external snapshot at timestamp ${state.userDb?.lastChangeTimestamp}`,
                    );
                    sync();
                }
            }, 10000);
            return () => {
                clearInterval(autoSync);
            };
        }
    }, [state.connection.storageLocation, state.userDb, state.userDb?.synced]);

    useEffect(() => {
        if (
            (state.connection.storageLocation ===
                Lib.StorageLocation.Web3Storage ||
                state.connection.storageLocation ===
                    Lib.StorageLocation.GoogleDrive) &&
            state.userDb &&
            !state.userDb.synced
        ) {
            Lib.log(
                `Create user storage external snapshot at timestamp ${state.userDb?.lastChangeTimestamp}`,
            );
            sync();
        }
    }, []);

    useEffect(() => {
        Lib.log(
            `Create user storage browser snapshot at timestamp ${state.userDb?.lastChangeTimestamp}`,
        );
        localforage.setItem(
            Lib.getBrowserStorageKey(state.connection.account!.address),
            Lib.sync(state.userDb).userStorage,
        );
    }, [state.userDb?.lastChangeTimestamp]);

    const showAlert =
        (!state.userDb?.synced &&
            state.connection.storageLocation === Lib.StorageLocation.File) ||
        state.userDb?.syncProcessState === Lib.SyncProcessState.Failed;

    return (
        <div className="mt-auto w-100 ">
            <div
                className={`row storage-view-container ${
                    showAlert ? ' not-synced' : ''
                }`}
            >
                <div className="col-12 storage-view text-center d-flex justify-content-between ">
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
                            className={`btn btn-sm btn-${
                                state.userDb?.synced
                                    ? 'outline-secondary'
                                    : 'secondary'
                            } no-border`}
                            disabled={
                                state.userDb?.syncProcessState ===
                                Lib.SyncProcessState.Running
                            }
                        >
                            {state.userDb?.syncProcessState ===
                            Lib.SyncProcessState.Running ? (
                                <span className="push-end">
                                    <Icon iconClass="fas fa-sync fa-spin" />
                                </span>
                            ) : (
                                <>
                                    {state.connection.storageLocation ===
                                    Lib.StorageLocation.File ? (
                                        <Icon iconClass="fas fa-download" />
                                    ) : (
                                        <Icon iconClass="fas fa-sync" />
                                    )}
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default StorageView;
