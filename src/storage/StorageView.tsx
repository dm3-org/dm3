import React, { useState } from 'react';
import 'react-chat-widget/lib/styles.css';
import * as Lib from '../lib';
import Icon from '../ui-shared/Icon';
import './Storage.css';

interface StorageViewProps {
    connection: Lib.Connection;
}

function StorageView(props: StorageViewProps) {
    const downloadDbFile = (e: any) => {
        e.preventDefault();
        const blob = new Blob([JSON.stringify(Lib.sync(props.connection))], {
            type: 'text/json',
        });

        const a = document.createElement('a');
        a.download = 'export.json';
        a.href = window.URL.createObjectURL(blob);
        const clickEvt = new MouseEvent('click', {
            view: window,
            bubbles: true,
            cancelable: true,
        });
        a.dispatchEvent(clickEvt);
        a.remove();
    };

    const upload = (event: any) => {
        if (event.target.files[0]) {
            const file = event.target.files[0];
            const reader = new FileReader();
            reader.onload = (e) => {
                if (e.target) {
                    Lib.load(
                        props.connection,
                        JSON.parse(e.target?.result as string),
                    );
                }
            };
            reader.readAsText(file);
        }
    };

    return (
        <div className="mt-auto w-100 ">
            <div className="row storage-view-container">
                <div className="col-12 storage-view text-center export-data">
                    <div className="row">
                        <div className="col-12">
                            <button
                                type="button"
                                onClick={downloadDbFile}
                                className={`w-100 btn btn-sm btn${
                                    props.connection.db.synced
                                        ? '-outline-secondary'
                                        : '-primary'
                                }`}
                            >
                                Save
                            </button>
                        </div>
                    </div>
                </div>
                <div className="col-12 storage-view">
                    {props.connection.db.synced ? (
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
                        title={`chainId: ${props.connection.provider.network.chainId}`}
                    >
                        <Icon iconClass="fas fa-network-wired" />
                        &nbsp;&nbsp;
                        {props.connection.provider.network.chainId}
                    </span>
                </div>
            </div>
        </div>
    );
}

export default StorageView;
