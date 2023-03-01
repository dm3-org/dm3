import React, { useContext, useEffect, useState } from 'react';
import './SignIn.css';

import * as Lib from 'dm3-lib';
import { GlobalContext } from '../GlobalContextProvider';
import StateButton, { ButtonState } from '../ui-shared/StateButton';
import {
    getMetaMaskProvider,
    connectAccount,
    getWalletConnectProvider,
} from './Connectors';
import { Web3Provider } from '@ethersproject/providers';
import WalletConnectProvider from '@walletconnect/web3-provider';

interface ConnectButtonProps {
    miniSignIn: boolean;
}

enum SelectedWallet {
    None,
    MetaMask,
    WalletConnect,
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
            if (selectedWallet === SelectedWallet.WalletConnect) {
                const account = (
                    (state.connection.provider as Web3Provider)
                        .provider as WalletConnectProvider
                ).accounts[0];

                connectAccount(state, dispatch, account);
            } else {
                connectAccount(state, dispatch);
            }
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

    return (
        <StateButton
            content={<>Connect Metamask</>}
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
