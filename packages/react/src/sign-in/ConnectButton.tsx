import React, { useContext, useEffect } from 'react';
import './SignIn.css';

import * as Lib from 'dm3-lib';
import { GlobalContext } from '../GlobalContextProvider';
import StateButton, { ButtonState } from '../ui-shared/StateButton';
import { getMetaMaskProvider, connectAccount } from './Connectors';
import { Linter } from 'eslint';

interface ConnectButtonProps {
    miniSignIn: boolean;
}

function ConnectButton(props: ConnectButtonProps) {
    const { state, dispatch } = useContext(GlobalContext);

    useEffect(() => {
        if (
            state.connection.provider &&
            state.connection.connectionState ===
                Lib.ConnectionState.AccountConntectReady
        ) {
            connectAccount(state, dispatch);
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

    const stateButton = (
        <StateButton
            content={<>{props.miniSignIn ? 'Connect' : 'Connect Account'}</>}
            btnState={getButtonState(state.connection.connectionState)}
            btnType="primary"
            onClick={() => getMetaMaskProvider(dispatch)}
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
    );

    return props.miniSignIn ? (
        stateButton
    ) : (
        <div className="row">
            <div className="col-md-5">{stateButton}</div>
            <div className="col-md-7 help-text">
                Connect an Ethereum account
                <p className="explanation">
                    The selected ethereum account will be used as your dm3
                    identity.
                </p>
            </div>
        </div>
    );
}

export default ConnectButton;
