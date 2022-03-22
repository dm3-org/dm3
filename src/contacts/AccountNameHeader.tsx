import React, { useContext, useEffect, useState } from 'react';
import Icon from '../ui-shared/Icon';
import * as Lib from '../lib';
import { GlobalContext } from '../GlobalContextProvider';
import { ConnectionType } from '../reducers/Connection';

interface AccountNameHeaderProps {
    account: Lib.Account;
}

function AccountNameHeader(props: AccountNameHeaderProps) {
    const { state, dispatch } = useContext(GlobalContext);
    return (
        <div className="account-name w-100 ">
            {Lib.getAccountDisplayName(props.account.address, state.ensNames)}
            {(state.connection.connectionState ===
                Lib.ConnectionState.SignedIn ||
                state.connection.connectionState ===
                    Lib.ConnectionState.KeyCreation) && (
                <>
                    {state.userDb?.keys?.publicMessagingKey ? (
                        <span className="push-end header-lock ">
                            <Icon iconClass="fas fa-lock align-bottom" />
                        </span>
                    ) : (
                        <span
                            className=" push-end header-lock header-open-lock"
                            onClick={() =>
                                dispatch({
                                    type: ConnectionType.ChangeConnectionState,
                                    payload: Lib.ConnectionState.KeyCreation,
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
