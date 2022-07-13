import React, { useContext, useEffect } from 'react';
import './SignIn.css';
import { ethers } from 'ethers';
import * as Lib from 'ens-mail-lib';
import { GlobalContext } from '../GlobalContextProvider';

import { ConnectionType } from '../reducers/Connection';
import localforage from 'localforage';
import StateButton, { ButtonState } from '../ui-shared/StateButton';
import { CacheType } from '../reducers/Cache';
import { UiStateType } from '../reducers/UiState';

interface ConnectButtonProps {
    miniSignIn: boolean;
}

function ConnectButton(props: ConnectButtonProps) {
    const { state, dispatch } = useContext(GlobalContext);

    const connect = async () => {
        dispatch({
            type: ConnectionType.ChangeConnectionState,
            payload: Lib.ConnectionState.WaitingForAccountConntection,
        });

        const accountConnection = await Lib.connectAccount(state.connection);

        dispatch({
            type: UiStateType.SetProfileExists,
            payload: accountConnection.existingAccount,
        });
        Lib.log(
            accountConnection.existingAccount
                ? '[Connection] connected to existing profile'
                : '[Connection] connected to new profile',
        );
        if (accountConnection.account && !accountConnection.existingAccount) {
            await localforage.removeItem(
                Lib.getBrowserStorageKey(accountConnection.account),
            );
        }

        if (accountConnection.account) {
            dispatch({
                type: ConnectionType.ChangeConnectionState,
                payload: accountConnection.connectionState,
            });
            dispatch({
                type: ConnectionType.ChangeAccount,
                payload: {
                    address: accountConnection.account,
                    profile: accountConnection.profile?.profileRegistryEntry,
                },
            });

            const ensName = await Lib.lookupAddress(
                state.connection.provider as ethers.providers.JsonRpcProvider,
                accountConnection.account,
            );
            if (ensName) {
                dispatch({
                    type: CacheType.AddEnsName,
                    payload: {
                        address: accountConnection.account,
                        name: ensName,
                    },
                });
            }
        } else {
            dispatch({
                type: ConnectionType.ChangeConnectionState,
                payload: accountConnection.connectionState,
            });
        }
    };

    const getButtonState = (
        connectionState: Lib.ConnectionState,
    ): ButtonState => {
        switch (connectionState) {
            case Lib.ConnectionState.AccountConnectionRejected:
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
            onClick={connect}
            disabled={
                !(
                    state.connection.connectionState ===
                        Lib.ConnectionState.AccountConntectReady ||
                    state.connection.connectionState ===
                        Lib.ConnectionState.AccountConnectionRejected
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
                    The selected ethereum account will be used as your ENS Mail
                    identity.
                </p>
            </div>
        </div>
    );
}

export default ConnectButton;
