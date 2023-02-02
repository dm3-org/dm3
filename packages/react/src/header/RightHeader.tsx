import React, { useContext } from 'react';
import 'react-chat-widget/lib/styles.css';
import AccountNameHeader from '../contacts/AccountNameHeader';
import ChatHeader from '../chat/ChatHeader';
import * as Lib from 'dm3-lib';
import './Header.css';
import { GlobalContext } from '../GlobalContextProvider';

function RightHeader() {
    const { state } = useContext(GlobalContext);

    if (
        state.connection.connectionState !==
        Lib.web3provider.ConnectionState.SignedIn
    ) {
        return (
            <div className="row header-row-right">
                <div
                    className={
                        `col-12 text-center account-name-container` +
                        ` d-flex justify-content-center align-items-center`
                    }
                >
                    <span className="account-name">dm3</span>
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
                    Lib.web3provider.ConnectionState.SignedIn && (
                    <ChatHeader
                        account={state.accounts.selectedContact?.account}
                    />
                )}
            </div>
        </div>
    );
}

export default RightHeader;
