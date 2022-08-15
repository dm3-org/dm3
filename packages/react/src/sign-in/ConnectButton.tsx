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
                Lib.ConnectionState.AccountConntectReady
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
        connectionState: Lib.ConnectionState,
    ): ButtonState => {
        switch (connectionState) {
            case Lib.ConnectionState.ConnectionRejected:
                return ButtonState.Failed;

            case Lib.ConnectionState.WaitingForAccountConntection:
                return ButtonState.Loading;

            case Lib.ConnectionState.SignInFailed:
            case Lib.ConnectionState.SignedIn:
            case Lib.ConnectionState.WaitingForSignIn:
            case Lib.ConnectionState.CollectingSignInData:
            case Lib.ConnectionState.SignInReady:
                return ButtonState.Success;

            default:
                return ButtonState.Idel;
        }
    };

    const connectReady =
        state.connection.connectionState ===
        Lib.ConnectionState.AccountConntectReady;

    const stateButton = (
        <>
            {(connectReady || selectedWallet === SelectedWallet.MetaMask) && (
                <StateButton
                    content={<>MetaMask</>}
                    btnState={getButtonState(state.connection.connectionState)}
                    btnType="primary"
                    onClick={() => {
                        setSelectedWallet(SelectedWallet.MetaMask);
                        getMetaMaskProvider(dispatch);
                    }}
                    disabled={
                        !(
                            state.connection.connectionState ===
                                Lib.ConnectionState.AccountConntectReady ||
                            state.connection.connectionState ===
                                Lib.ConnectionState.ConnectionRejected
                        )
                    }
                    className={
                        props.miniSignIn
                            ? 'left-state-btn miniSignInBtn'
                            : 'left-state-btn'
                    }
                />
            )}
            {(connectReady ||
                selectedWallet === SelectedWallet.WalletConnect) && (
                <StateButton
                    content={<>WalletConnect</>}
                    btnState={getButtonState(state.connection.connectionState)}
                    btnType="primary"
                    onClick={() => {
                        setSelectedWallet(SelectedWallet.WalletConnect);
                        getWalletConnectProvider(dispatch);
                    }}
                    disabled={
                        !(
                            state.connection.connectionState ===
                                Lib.ConnectionState.AccountConntectReady ||
                            state.connection.connectionState ===
                                Lib.ConnectionState.ConnectionRejected
                        )
                    }
                    className={`${
                        state.connection.connectionState ===
                        Lib.ConnectionState.AccountConntectReady
                            ? 'mt-2'
                            : ''
                    } ${
                        props.miniSignIn
                            ? 'left-state-btn miniSignInBtn'
                            : 'left-state-btn'
                    }`}
                />
            )}
        </>
    );

    return props.miniSignIn ? (
        stateButton
    ) : (
        <div className="row">
            <div className="col-md-5">{stateButton}</div>
            <div className="col-md-7 help-text">
                Connect a Wallet
                <p className="explanation">
                    The selected ethereum account will be used as your dm3
                    identity.
                </p>
            </div>
        </div>
    );
}

export default ConnectButton;
