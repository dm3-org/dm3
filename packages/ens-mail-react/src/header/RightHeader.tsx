import React, { useContext } from 'react';
import 'react-chat-widget/lib/styles.css';
import AccountNameHeader from '../contacts/AccountNameHeader';
import ChatHeader from '../chat/ChatHeader';
import * as Lib from 'ens-mail-lib';
import './Header.css';
import { GlobalContext } from '../GlobalContextProvider';

function RightHeader() {
    const { state } = useContext(GlobalContext);

    if (state.connection.connectionState !== Lib.ConnectionState.SignedIn) {
        return (
            <div className="row header-row-right">
                <div
                    className={
                        `col-12 text-center account-name-container` +
                        ` d-flex justify-content-center align-items-center`
                    }
                >
                    <span className="account-name">ENS Mail</span>
                </div>
            </div>
        );
    }

    return (
        <div className="header-row-right">
            <div
                className={
                    `text-center account-name-container` +
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

export default RightHeader;
