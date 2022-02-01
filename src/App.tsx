import React, { useEffect, useState } from 'react';
import './App.css';
import { ConnecteionState, getWeb3Provider } from './lib/Web3Provider';
import { log } from './lib/log';
import { ethers } from 'ethers';
import detectEthereumProvider from '@metamask/detect-provider';
import SignIn, { showSignIn } from './SignIn';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

function App() {
    const [connectionState, setConnectionState] = useState<ConnecteionState>(
        ConnecteionState.CheckingProvider,
    );

    const [account, setAccount] = useState<string | undefined>();
    const [sessionToken, setSessionToken] = useState<string | undefined>();

    const [web3Provider, setWeb3Provider] = useState<
        ethers.providers.JsonRpcProvider | undefined
    >();

    const changeConnectionState = (newConnectionState: ConnecteionState) => {
        log(
            `Changing state from  ${ConnecteionState[connectionState]} to ${ConnecteionState[newConnectionState]}`,
        );
        setConnectionState(newConnectionState);
    };

    const createWeb3Provider = async () => {
        const web3Provider = await getWeb3Provider(
            await detectEthereumProvider(),
        );
        changeConnectionState(web3Provider.connectionState);
        if (web3Provider.provider) {
            setWeb3Provider(web3Provider.provider);
        }
    };

    useEffect(() => {
        if (!web3Provider) {
            createWeb3Provider();
        }
    }, [web3Provider]);

    return (
        <div className="container">
            <div className="row row-space">
                {connectionState === ConnecteionState.NoProvider && (
                    <div className="col-md-12 text-center">
                        No Ethereum provider detected.
                    </div>
                )}
                {connectionState ===
                    ConnecteionState.AccountConnectionRejected && (
                    <div className="col-md-12 text-center">Rejected</div>
                )}
                {web3Provider && showSignIn(connectionState) && (
                    <div className="col-md-12 text-center">
                        <SignIn
                            web3Provider={web3Provider}
                            connectionState={connectionState}
                            changeConnectionState={changeConnectionState}
                            setAccount={setAccount}
                            account={account as string}
                            setSessionToken={setSessionToken}
                        />
                    </div>
                )}
            </div>
        </div>
    );
}

export default App;
