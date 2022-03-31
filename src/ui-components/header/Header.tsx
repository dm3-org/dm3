import React, { useContext } from 'react';
import 'react-chat-widget/lib/styles.css';
import AccountNameHeader from '../contacts/AccountNameHeader';
import ChatHeader from '../chat/ChatHeader';
import * as Lib from '../../lib';
import './Header.css';
import { GlobalContext } from '../GlobalContextProvider';

function Header() {
    const { state } = useContext(GlobalContext);

    if (state.connection.connectionState !== Lib.ConnectionState.SignedIn) {
        return (
            <div className="row header-row">
                <div
                    className={
                        `col-12 text-center chat-header account-name-container` +
                        ` d-flex justify-content-center align-items-center`
                    }
                >
                    <span className="account-name">ENS Mail</span>
                </div>
            </div>
        );
    }

    return (
        <div className="row header-row">
            <div
                className={
                    `account-name-container col-4 text-center` +
                    ` d-flex justify-content-center align-items-center`
                }
            >
                {state.connection?.account && (
                    <AccountNameHeader account={state.connection.account} />
                )}
            </div>
            <div
                className={
                    `col-8 text-center chat-header account-name-container` +
                    ` d-flex justify-content-center align-items-center`
                }
            >
                {state.accounts.selectedContact &&
                    state.connection?.connectionState ===
                        Lib.ConnectionState.SignedIn && (
                        <ChatHeader account={state.accounts.selectedContact} />
                    )}
                {state.connection?.connectionState !==
                    Lib.ConnectionState.SignedIn && (
                    <div className="account-name">
                        {state.connection?.connectionState ===
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
