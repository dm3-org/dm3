import React, { useContext, useEffect, useState } from 'react';
import Icon from '../ui-shared/Icon';
import * as Lib from '../lib';
import { GlobalContext } from '../GlobalContextProvider';
import Avatar from '../ui-shared/Avatar';
import { AccountsType } from '../reducers/Accounts';
import { AccountInfo } from '../reducers/shared';

interface ChatHeaderProps {
    account: Lib.Account;
}

function ChatHeader(props: ChatHeaderProps) {
    const { state, dispatch } = useContext(GlobalContext);

    if (state.accounts.accountInfoView !== AccountInfo.None) {
        return (
            <div className="account-name w-100   text-center">Account Info</div>
        );
    }
    return (
        <div
            className="account-name w-100 d-flex justify-content-between account-header"
            onClick={() =>
                dispatch({
                    type: AccountsType.SetAccountInfoView,
                    payload: AccountInfo.Contact,
                })
            }
        >
            <div className="d-flex align-items-center">
                <div className="d-flex contact-entry-avatar">
                    <Avatar contact={props.account} />
                </div>
            </div>
            <div>
                {Lib.getAccountDisplayName(
                    props.account.address,
                    state.ensNames,
                )}
            </div>
            {props.account.publicKeys?.publicMessagingKey ? (
                <div className="push-end header-lock text-success">
                    <Icon iconClass="fas fa-user-check align-bottom" />
                </div>
            ) : (
                <div
                    className=" push-end header-lock header-lock text-warning"
                    title="Waiting for user to register public keys"
                >
                    <Icon iconClass="fas fa-user-clock align-bottom" />
                </div>
            )}
        </div>
    );
}

export default ChatHeader;
