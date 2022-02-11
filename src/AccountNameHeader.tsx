import React, { useEffect, useState } from 'react';
import './App.css';
import Icon from './Icon';
import {
    Account,
    ApiConnection,
    ConnectionState,
    getAccountDisplayName,
} from './lib/Web3Provider';

interface AccountNameHeaderProps {
    account: Account;
    ensNames: Map<string, string>;
    apiConnection: ApiConnection;
    changeApiConnection: (apiConnection: Partial<ApiConnection>) => void;
}

function AccountNameHeader(props: AccountNameHeaderProps) {
    return (
        <div className="account-name w-100 ">
            {getAccountDisplayName(props.account.address, props.ensNames)}
            {(props.apiConnection.connectionState ===
                ConnectionState.SignedIn ||
                props.apiConnection.connectionState ===
                    ConnectionState.KeyCreation) && (
                <>
                    {props.account.publicKey ? (
                        <span className="push-end header-lock ">
                            <Icon iconClass="fas fa-lock align-bottom" />
                        </span>
                    ) : (
                        <span
                            className=" push-end header-lock header-open-lock"
                            onClick={() =>
                                props.changeApiConnection({
                                    connectionState:
                                        ConnectionState.KeyCreation,
                                })
                            }
                        >
                            <Icon iconClass="fas fa-lock-open align-bottom" />
                        </span>
                    )}
                </>
            )}
        </div>
    );
}

export default AccountNameHeader;
