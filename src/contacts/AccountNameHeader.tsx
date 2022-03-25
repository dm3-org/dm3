import React, { useContext, useEffect, useState } from 'react';
import Icon from '../ui-shared/Icon';
import * as Lib from '../lib';
import { GlobalContext } from '../GlobalContextProvider';
import { ConnectionType } from '../reducers/Connection';
import Avatar from '../ui-shared/Avatar';
import { AccountsType } from '../reducers/Accounts';
import { AccountInfo } from '../reducers/shared';

interface AccountNameHeaderProps {
    account: Lib.Account;
}

function AccountNameHeader(props: AccountNameHeaderProps) {
    const { state, dispatch } = useContext(GlobalContext);
    return (
        <div
            className="account-name w-100 d-flex justify-content-between account-header"
            onClick={() =>
                dispatch({
                    type: AccountsType.SetAccountInfoView,
                    payload: AccountInfo.Account,
                })
            }
        >
            <div className="d-flex align-items-center">
                <div className="d-flex contact-entry-avatar">
                    <Avatar contact={props.account} />
                </div>
            </div>

            <div className="w-100 text-start account-name-text">
                {Lib.getAccountDisplayName(
                    props.account.address,
                    state.ensNames,
                )}
            </div>
        </div>
    );
}

export default AccountNameHeader;
