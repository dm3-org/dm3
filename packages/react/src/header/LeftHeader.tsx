import { useContext } from 'react';
import 'react-chat-widget/lib/styles.css';
import { GlobalContext } from '../GlobalContextProvider';
import AccountNameHeader from '../contacts/AccountNameHeader';
import './Header.css';
import { ConnectionState } from '../web3provider/Web3Provider';

function LeftHeader() {
    const { state } = useContext(GlobalContext);

    return state.connection.connectionState !==
       ConnectionState.SignedIn ? null : (
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
