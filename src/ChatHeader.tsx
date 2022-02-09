import React, { useEffect, useState } from 'react';
import './App.css';
import { getAccountDisplayName } from './lib/Web3Provider';

interface ChatHeaderProps {
    account: string;
    ensNames: Map<string, string>;
}

function ChatHeader(props: ChatHeaderProps) {
    return (
        <div className="account-name">
            {getAccountDisplayName(props.account, props.ensNames)}
        </div>
    );
}

export default ChatHeader;
