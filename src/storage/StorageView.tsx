import React, { useContext, useState } from 'react';
import 'react-chat-widget/lib/styles.css';
import { GlobalContext } from '../GlobalContextProvider';
import * as Lib from '../lib';
import { UserDbType } from '../reducers/UserDB';
import Icon from '../ui-shared/Icon';
import './Storage.css';

interface StorageViewProps {
    connection: Lib.Connection;
}

function StorageView(props: StorageViewProps) {
    const { state, dispatch } = useContext(GlobalContext);
    const sync = async (e: any) => {
        e.preventDefault();
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
                    [JSON.stringify(Lib.sync(state.connection, state.userDb))],
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

    return (
        <div className="mt-auto w-100 ">
            <div className="row storage-view-container">
                <div className="col-12 storage-view text-center export-data">
                    <div className="row">
                        <div className="col-12">
                            <button
                                type="button"
                                onClick={sync}
                                className={`w-100 btn btn-sm btn${
                                    state.userDb?.synced
                                        ? '-outline-secondary'
                                        : '-primary'
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
                <div className="col-12 storage-view">
                    {state.userDb?.synced ? (
                        <span
                            className="badge bg-secondary text-dark outline-badge only-outline"
                            title="Data synced"
                        >
                            <Icon iconClass="fas fa-database" />
                            &nbsp;&nbsp;synced
                        </span>
                    ) : (
                        <span
                            className="badge bg-secondary text-dark outline-badge only-outline"
                            title="Data out of sync"
                        >
                            <Icon iconClass="fas fa-database" />
                            &nbsp;&nbsp;out of sync
                        </span>
                    )}
                    &nbsp;
                    <span
                        className="badge bg-secondary text-dark outline-badge only-outline"
                        title={`chainId: ${
                            state.connection.provider!.network.chainId
                        }`}
                    >
                        <Icon iconClass="fas fa-network-wired" />
                        &nbsp;&nbsp;
                        {state.connection.provider!.network.chainId}
                    </span>
                </div>
            </div>
        </div>
    );
}

export default StorageView;
