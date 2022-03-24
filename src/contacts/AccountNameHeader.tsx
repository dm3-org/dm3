import React, { useContext, useEffect, useState } from 'react';
import Icon from '../ui-shared/Icon';
import * as Lib from '../lib';
import { GlobalContext } from '../GlobalContextProvider';
import { ConnectionType } from '../reducers/Connection';
import Avatar from '../ui-shared/Avatar';

interface AccountNameHeaderProps {
    account: Lib.Account;
}

function AccountNameHeader(props: AccountNameHeaderProps) {
    const { state, dispatch } = useContext(GlobalContext);
    return (
        <div className="account-name w-100 d-flex justify-content-between">
            <div>
                <Avatar contact={props.account} />
            </div>
            <div>
                {Lib.getAccountDisplayName(
                    props.account.address,
                    state.ensNames,
                )}
            </div>
            {(state.connection.connectionState ===
                Lib.ConnectionState.SignedIn ||
                state.connection.connectionState ===
                    Lib.ConnectionState.KeyCreation) && (
                <>
                    {state.userDb?.keys?.publicMessagingKey ? (
                        <div className="push-end header-lock ">
                            <Icon iconClass="fas fa-lock align-bottom" />
                        </div>
                    ) : (
                        <div
                            className=" push-end header-lock header-open-lock"
                            onClick={() =>
                                dispatch({
                                    type: ConnectionType.ChangeConnectionState,
                                    payload: Lib.ConnectionState.KeyCreation,
                                })
                            }
                        >
                            <Icon iconClass="fas fa-lock-open align-bottom" />
                        </div>
                    )}
                </>
            )}
        </div>
    );
}

export default AccountNameHeader;
