import React, { useContext } from 'react';
import 'react-chat-widget/lib/styles.css';
import AccountNameHeader from '../contacts/AccountNameHeader';
import ChatHeader from '../chat/ChatHeader';
import * as Lib from 'ens-mail-lib';
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
        <div className="row header-row ">
            <div
                className={
                    `account-name-container col-4 text-center` +
                    ` d-flex justify-content-center align-items-center pe-0`
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
                {state.connection?.connectionState ===
                    Lib.ConnectionState.SignedIn && (
                    <ChatHeader account={state.accounts.selectedContact} />
                )}
            </div>
        </div>
    );
}

export default Header;
