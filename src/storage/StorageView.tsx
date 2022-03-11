import React from 'react';
import 'react-chat-widget/lib/styles.css';
import * as Lib from '../lib';
import Icon from '../ui-shared/Icon';
import './Storage.css';

interface StorageViewProps {
    connection: Lib.Connection;
}

function StorageView(props: StorageViewProps) {
    return (
        <div className="mt-auto w-100 ">
            <div className="row storage-view-container">
                <div className="col-12 storage-view text-center brand">
                    ENS Mail v0.0.2
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
                            className="badge bg-warning text-dark outline-badge"
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
                        &nbsp;&nbsp;{props.connection.provider.network.chainId}
                    </span>
                </div>
            </div>
        </div>
    );
}

export default StorageView;
