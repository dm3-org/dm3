import React, { useEffect, useState } from 'react';
import Icon from '../ui-shared/Icon';
import * as Lib from '../lib';

interface AccountNameHeaderProps {
    account: Lib.Account;
    ensNames: Map<string, string>;
    connection: Lib.Connection;
    changeConnection: (connection: Partial<Lib.Connection>) => void;
}

function AccountNameHeader(props: AccountNameHeaderProps) {
    return (
        <div className="account-name w-100 ">
            {Lib.getAccountDisplayName(props.account.address, props.ensNames)}
            {(props.connection.connectionState ===
                Lib.ConnectionState.SignedIn ||
                props.connection.connectionState ===
                    Lib.ConnectionState.KeyCreation) && (
                <>
                    {props.account.keys?.publicMessagingKey ? (
                        <span className="push-end header-lock ">
                            <Icon iconClass="fas fa-lock align-bottom" />
                        </span>
                    ) : (
                        <span
                            className=" push-end header-lock header-open-lock"
                            onClick={() =>
                                props.changeConnection({
                                    connectionState:
                                        Lib.ConnectionState.KeyCreation,
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
