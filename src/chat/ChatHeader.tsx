import React, { useEffect, useState } from 'react';
import Icon from '../ui-shared/Icon';
import * as Lib from '../lib';

interface ChatHeaderProps {
    account: Lib.Account;
    ensNames: Map<string, string>;
}

function ChatHeader(props: ChatHeaderProps) {
    return (
        <div className="account-name w-100">
            {Lib.getAccountDisplayName(props.account.address, props.ensNames)}
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
