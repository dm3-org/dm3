import React, { useContext, useEffect, useState } from 'react';
import 'react-chat-widget/lib/styles.css';
import { GlobalContext } from '../GlobalContextProvider';
import * as Lib from '../../lib';
import { UserDbType } from '../reducers/UserDB';
import Icon from '../ui-shared/Icon';
import './Storage.css';

function StorageView() {
    const { state, dispatch } = useContext(GlobalContext);
    const sync = async (event?: any) => {
        if (event) {
            event.preventDefault();
        }
        dispatch({ type: UserDbType.setSycingInProgress, payload: true });
        try {
            if (
                state.connection.storageLocation ===
                Lib.StorageLocation.Web3Storage
            ) {
                await Lib.web3Store(
                    state.connection,
                    state.userDb as Lib.UserDB,
                );
                dispatch({ type: UserDbType.setSynced, payload: true });
            } else {
                const blob = new Blob(
                    [JSON.stringify(Lib.sync(state.userDb))],
                    {
                        type: 'text/json',
                    },
                );

                const a = document.createElement('a');
                a.download = `${Lib.getAccountDisplayName(
                    state.connection.account!.address,
                    state.ensNames,
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
                dispatch({ type: UserDbType.setSynced, payload: true });
            }
        } catch (e) {
            Lib.log(e as string);
        }
        dispatch({ type: UserDbType.setSycingInProgress, payload: false });
    };

    useEffect(() => {
        if (
            state.connection.storageLocation === Lib.StorageLocation.Web3Storage
        ) {
            const autoSync = setInterval(() => {
                if (state.userDb && !state.userDb.synced) {
                    sync();
                }
            }, 10000);
            return () => {
                clearInterval(autoSync);
            };
        }
    }, [state.connection.storageLocation, state.userDb, state.userDb?.synced]);

    return (
        <div className="mt-auto w-100 ">
            <div
                className={`row storage-view-container ${
                    !state.userDb?.synced &&
                    state.connection.storageLocation ===
                        Lib.StorageLocation.File
                        ? ' not-synced'
                        : ''
                }`}
            >
                <div className="col-12 storage-view text-center export-data">
                    <div className="row">
                        <div className="col-12">
                            <button
                                type="button"
                                onClick={sync}
                                className={`w-100 btn btn-sm btn${
                                    state.userDb?.synced ||
                                    state.connection.storageLocation !==
                                        Lib.StorageLocation.File
                                        ? '-outline-secondary'
                                        : '-light'
                                }`}
                                disabled={state.userDb?.syncingInProgress}
                            >
                                Save{' '}
                                {state.userDb?.syncingInProgress && (
                                    <span className="push-end">
                                        <Icon iconClass="fas fa-spinner fa-spin" />
                                    </span>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
                <div className="col-12 storage-view-bottom">
                    {!state.userDb?.synced &&
                        state.connection.storageLocation ===
                            Lib.StorageLocation.File && (
                            <span className="alert-msg">
                                <Icon iconClass="fas fa-exclamation-triangle" />
                                &nbsp;&nbsp;Storage out of sync. New data could
                                be lost.
                            </span>
                        )}
                </div>
            </div>
        </div>
    );
}

export default StorageView;
