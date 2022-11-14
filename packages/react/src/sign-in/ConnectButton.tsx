import React, { useContext, useEffect, useState } from 'react';
import './SignIn.css';

import * as Lib from 'dm3-lib';
import { GlobalContext } from '../GlobalContextProvider';
import StateButton, { ButtonState } from '../ui-shared/StateButton';
import { getMetaMaskProvider, connectAccount } from './Connectors';
import { Web3Provider } from '@ethersproject/providers';

interface ConnectButtonProps {
    miniSignIn: boolean;
}

enum SelectedWallet {
    None,
    MetaMask,
}

function ConnectButton(props: ConnectButtonProps) {
    const { state, dispatch } = useContext(GlobalContext);
    const [selectedWallet, setSelectedWallet] = useState(SelectedWallet.None);

    useEffect(() => {
        if (
            state.connection.provider &&
            state.connection.connectionState ===
                Lib.web3provider.ConnectionState.AccountConntectReady
        ) {
            connectAccount(state, dispatch);
        }
    }, [state.connection.provider, state.connection.connectionState]);

    const getButtonState = (
        connectionState: Lib.web3provider.ConnectionState,
    ): ButtonState => {
        switch (connectionState) {
            case Lib.web3provider.ConnectionState.SignInFailed:
            case Lib.web3provider.ConnectionState.ConnectionRejected:
                return ButtonState.Failed;

            case Lib.web3provider.ConnectionState.SignInReady:
            case Lib.web3provider.ConnectionState.WaitingForSignIn:
            case Lib.web3provider.ConnectionState.WaitingForAccountConntection:
                return ButtonState.Loading;

            case Lib.web3provider.ConnectionState.SignedIn:
                return ButtonState.Success;

            case Lib.web3provider.ConnectionState.AccountConntectReady:
            case Lib.web3provider.ConnectionState.CollectingSignInData:
            default:
                return ButtonState.Idel;
        }
    };

    const buttonDisabled = !(
        state.connection.connectionState ===
            Lib.web3provider.ConnectionState.AccountConntectReady ||
        state.connection.connectionState ===
            Lib.web3provider.ConnectionState.ConnectionRejected ||
        state.connection.connectionState ===
            Lib.web3provider.ConnectionState.SignInFailed
    );

    const stateButton = (
        <>
            <StateButton
                content={<>MetaMask</>}
                btnState={getButtonState(state.connection.connectionState)}
                btnType="primary"
                onClick={() => {
                    setSelectedWallet(SelectedWallet.MetaMask);
                    getMetaMaskProvider(dispatch);
                }}
                disabled={buttonDisabled}
                className={
                    props.miniSignIn
                        ? 'left-state-btn miniSignInBtn'
                        : 'left-state-btn'
                }
            />
        </>
    );

    return props.miniSignIn ? (
        stateButton
    ) : (
        <div className="row mt-4">
            <div className="col-md-5">{stateButton}</div>
            <div className="col-md-7 help-text">
                Connect and sign in
                <p className="explanation">
                    The selected Ethereum account will be used as your dm3
                    identity. After connecting an account, you must sign a
                    message to create your encryption key.
                </p>
            </div>
        </div>
    );
}

export default ConnectButton;
