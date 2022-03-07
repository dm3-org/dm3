import React from 'react';
import 'react-chat-widget/lib/styles.css';
import AccountNameHeader from '../contacts/AccountNameHeader';
import ChatHeader from '../chat/ChatHeader';
import * as Lib from '../lib';
import './Header.css';

interface HeaderProps {
    apiConnection: {
        connectionState: Lib.ConnectionState;
    } & Partial<Lib.ApiConnection>;
    ensNames: Map<string, string>;
    contacts?: Lib.Account[];
    selectedContact: Lib.Account | undefined;
    changeApiConnection: (newApiConnection: Partial<Lib.ApiConnection>) => void;
}

function Header(props: HeaderProps) {
    return (
        <div className="row header-row">
            <div
                className={
                    `account-name-container col-4 text-center` +
                    ` d-flex justify-content-center align-items-center`
                }
            >
                {props.apiConnection?.account && (
                    <AccountNameHeader
                        account={props.apiConnection.account}
                        ensNames={props.ensNames}
                        apiConnection={props.apiConnection as Lib.ApiConnection}
                        changeApiConnection={props.changeApiConnection}
                    />
                )}
            </div>
            <div
                className={
                    `col-8 text-center chat-header account-name-container` +
                    ` d-flex justify-content-center align-items-center`
                }
            >
                {props.selectedContact &&
                    props.apiConnection?.connectionState ===
                        Lib.ConnectionState.SignedIn && (
                        <ChatHeader
                            account={props.selectedContact}
                            ensNames={props.ensNames}
                        />
                    )}
                {props.apiConnection?.connectionState !==
                    Lib.ConnectionState.SignedIn && (
                    <div className="account-name">
                        {props.apiConnection?.connectionState ===
                        Lib.ConnectionState.KeyCreation
                            ? 'Create Public Key'
                            : 'ENS Mail'}
                    </div>
                )}
            </div>
        </div>
    );
}

export default Header;
