import React, { useEffect, useState } from 'react';
import './App.css';
import Icon from './Icon';
import { Account, getAccountDisplayName } from './lib/Web3Provider';

interface ChatHeaderProps {
    account: Account;
    ensNames: Map<string, string>;
}

function ChatHeader(props: ChatHeaderProps) {
    return (
        <div className="account-name w-100">
            {getAccountDisplayName(props.account.address, props.ensNames)}
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
