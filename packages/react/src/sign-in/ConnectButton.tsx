import React, { useContext, useEffect, useState } from 'react';
import './SignIn.css';
import { GlobalContext } from '../GlobalContextProvider';
import StateButton, { ButtonState } from '../ui-shared/StateButton';
import { getMetaMaskProvider, connectAccount } from './Connectors';
import { ConnectionState } from '../web3provider/Web3Provider';

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
                ConnectionState.AccountConntectReady
        ) {
            connectAccount(state, dispatch);
        }
    }, [state.connection.provider, state.connection.connectionState]);

    const getButtonState = (
        connectionState: ConnectionState,
    ): ButtonState => {
        switch (connectionState) {
            case ConnectionState.SignInFailed:
            case ConnectionState.ConnectionRejected:
                return ButtonState.Failed;

            case ConnectionState.SignInReady:
            case ConnectionState.WaitingForSignIn:
            case ConnectionState.WaitingForAccountConntection:
                return ButtonState.Loading;

            case ConnectionState.SignedIn:
                return ButtonState.Success;

            case ConnectionState.AccountConntectReady:
            case ConnectionState.CollectingSignInData:
            default:
                return ButtonState.Idel;
        }
    };

    const buttonDisabled = !(
        state.connection.connectionState ===
            ConnectionState.AccountConntectReady ||
        state.connection.connectionState ===
            ConnectionState.ConnectionRejected ||
        state.connection.connectionState ===
            ConnectionState.SignInFailed
    );

    return (
        <StateButton
            content={<>Sign In</>}
            btnState={getButtonState(state.connection.connectionState)}
            btnType="secondary"
            onClick={() => {
                setSelectedWallet(SelectedWallet.MetaMask);
                getMetaMaskProvider(dispatch);
            }}
            disabled={buttonDisabled}
            className="sign-in-btn"
        />
    );
}

export default ConnectButton;
