import React, { useEffect, useState } from 'react';
import './App.css';
import Icon from './Icon';
import * as Lib from './lib';

interface ChatHeaderProps {
    account: Lib.Account;
    ensNames: Map<string, string>;
}

function ChatHeader(props: ChatHeaderProps) {
    return (
        <div className="account-name w-100">
            {Lib.getAccountDisplayName(props.account.address, props.ensNames)}
            {props.account.keys?.publicMessagingKey ? (
                <span className="push-end header-lock ">
                    <Icon iconClass="fas fa-lock align-bottom" />
                </span>
            ) : (
                <span className=" push-end header-lock header-lock">
                    <Icon iconClass="fas fa-lock-open align-bottom" />
                </span>
            )}
        </div>
    );
}

export default ChatHeader;
