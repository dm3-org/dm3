import { useContext } from 'react';
import 'react-chat-widget/lib/styles.css';
import { GlobalContext } from '../GlobalContextProvider';
import ChatHeader from '../chat/ChatHeader';
import './Header.css';
import { ConnectionState } from '../web3provider/Web3Provider';

function RightHeader() {
    const { state } = useContext(GlobalContext);

    if (state.connection.connectionState !== ConnectionState.SignedIn) {
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
                    ConnectionState.SignedIn && (
                    <ChatHeader
                        account={state.accounts.selectedContact?.account}
                    />
                )}
            </div>
        </div>
    );
}

export default RightHeader;
