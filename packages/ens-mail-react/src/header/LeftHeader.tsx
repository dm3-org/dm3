import React, { useContext } from 'react';
import 'react-chat-widget/lib/styles.css';
import AccountNameHeader from '../contacts/AccountNameHeader';
import ChatHeader from '../chat/ChatHeader';
import * as Lib from 'ens-mail-lib';
import './Header.css';
import { GlobalContext } from '../GlobalContextProvider';

function LeftHeader() {
    const { state } = useContext(GlobalContext);

    if (state.connection.connectionState !== Lib.ConnectionState.SignedIn) {
        return (
            <div className="row header-row-left top-left-radius">
                <div
                    className={
                        `col-12 text-center chat-header` +
                        ` d-flex justify-content-center align-items-center`
                    }
                >
                    <span className="account-name">ENS Mail</span>
                </div>
            </div>
        );
    }

    return (
        <div className="ps-3 header-row-left w-100 top-left-radius pe-3">
            <div
                className={
                    ` w-100 text-center` +
                    ` d-flex justify-content-center align-items-center`
                }
            >
                {state.connection?.account && (
                    <AccountNameHeader account={state.connection.account} />
                )}
            </div>
        </div>
    );
}

export default LeftHeader;
