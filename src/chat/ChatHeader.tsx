import React, { useContext, useEffect, useState } from 'react';
import Icon from '../ui-shared/Icon';
import * as Lib from '../lib';
import { GlobalContext } from '../GlobalContextProvider';

interface ChatHeaderProps {
    account: Lib.Account;
}

function ChatHeader(props: ChatHeaderProps) {
    const { state, dispatch } = useContext(GlobalContext);
    return (
        <div className="account-name w-100">
            {Lib.getAccountDisplayName(props.account.address, state.ensNames)}
            {props.account.publicKeys?.publicMessagingKey ? (
                <span className="push-end header-lock text-success">
                    <Icon iconClass="fas fa-user-check align-bottom" />
                </span>
            ) : (
                <span
                    className=" push-end header-lock header-lock text-warning"
                    title="Waiting for user to register public keys"
                >
                    <Icon iconClass="fas fa-user-clock align-bottom" />
                </span>
            )}
        </div>
    );
}

export default ChatHeader;
