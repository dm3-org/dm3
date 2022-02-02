import React, { useEffect, useState } from 'react';
import './App.css';
import { getAccountDisplayName } from './lib/Web3Provider';

interface AccountNameHeaderProps {
    account: string;
    ensNames: Map<string, string>;
}

function AccountNameHeader(props: AccountNameHeaderProps) {
    return <h3>{getAccountDisplayName(props.account, props.ensNames)}</h3>;
}

export default AccountNameHeader;
