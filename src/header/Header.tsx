import React from 'react';
import 'react-chat-widget/lib/styles.css';
import AccountNameHeader from '../contacts/AccountNameHeader';
import ChatHeader from '../chat/ChatHeader';
import * as Lib from '../lib';
import './Header.css';

interface HeaderProps {
    connection: {
        connectionState: Lib.ConnectionState;
    } & Partial<Lib.Connection>;
    ensNames: Map<string, string>;
    contacts?: Lib.Account[];
    selectedContact: Lib.Account | undefined;
    changeConnection: (newConnection: Partial<Lib.Connection>) => void;
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
                {props.connection?.account && (
                    <AccountNameHeader
                        account={props.connection.account}
                        ensNames={props.ensNames}
                        connection={props.connection as Lib.Connection}
                        changeConnection={props.changeConnection}
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
                    props.connection?.connectionState ===
                        Lib.ConnectionState.SignedIn && (
                        <ChatHeader
                            account={props.selectedContact}
                            ensNames={props.ensNames}
                        />
                    )}
                {props.connection?.connectionState !==
                    Lib.ConnectionState.SignedIn && (
                    <div className="account-name">
                        {props.connection?.connectionState ===
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
