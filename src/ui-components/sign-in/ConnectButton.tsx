import React, { useContext } from 'react';
import './SignIn.css';
import { ethers } from 'ethers';
import Icon from '../ui-shared/Icon';
import * as Lib from '../../lib';
import { GlobalContext } from '../GlobalContextProvider';
import { EnsNameType } from '../reducers/EnsNames';

import { ConnectionType } from '../reducers/Connection';

interface ConnectButtonProps {
    setExistingAccount: (exists: boolean) => void;
}

function ConnectButton(props: ConnectButtonProps) {
    const { state, dispatch } = useContext(GlobalContext);

    const connect = async () => {
        dispatch({
            type: ConnectionType.ChangeConnectionState,
            payload: Lib.ConnectionState.WaitingForAccountConntection,
        });

        const accountConnection = await Lib.connectAccount(
            state.connection.provider!,
        );

        props.setExistingAccount(accountConnection.existingAccount);

        if (accountConnection.account) {
            dispatch({
                type: ConnectionType.ChangeConnectionState,
                payload: accountConnection.connectionState,
            });
            dispatch({
                type: ConnectionType.ChangeAccount,
                payload: {
                    address: accountConnection.account,
                },
            });

            const ensName = await Lib.lookupAddress(
                state.connection.provider as ethers.providers.JsonRpcProvider,
                accountConnection.account,
            );
            if (ensName) {
                dispatch({
                    type: EnsNameType.AddEnsName,
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

    const getConnectionIconClass = (connectionState: Lib.ConnectionState) => {
        switch (connectionState) {
            case Lib.ConnectionState.AccountConnectionRejected:
                return <Icon iconClass="fas fa-exclamation-circle" />;

            case Lib.ConnectionState.WaitingForAccountConntection:
                return <Icon iconClass="fas fa-spinner fa-spin" />;

            case Lib.ConnectionState.SignInFailed:
            case Lib.ConnectionState.SignedIn:
            case Lib.ConnectionState.WaitingForSignIn:
            case Lib.ConnectionState.CollectingSignInData:
            case Lib.ConnectionState.SignInReady:
                return <Icon iconClass="fas fa-check-circle" />;

            default:
                return null;
        }
    };

    return (
        <div className="row">
            <div className="col-md-5">
                <button
                    onClick={connect}
                    type="button"
                    className={`btn btn-${
                        state.connection.connectionState ===
                        Lib.ConnectionState.AccountConnectionRejected
                            ? 'danger'
                            : 'primary'
                    } btn-lg w-100`}
                    disabled={
                        !(
                            state.connection.connectionState ===
                                Lib.ConnectionState.AccountConntectReady ||
                            state.connection.connectionState ===
                                Lib.ConnectionState.AccountConnectionRejected
                        )
                    }
                >
                    Connect Account
                    <span className="push-end">
                        {getConnectionIconClass(
                            state.connection.connectionState,
                        )}
                    </span>
                </button>
            </div>
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
