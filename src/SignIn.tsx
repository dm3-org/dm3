import React, { useEffect } from 'react';
import './App.css';
import {
    Account,
    ApiConnection,
    connectAccount,
    ConnectionState,
    signIn,
} from './lib/Web3Provider';
import { ethers } from 'ethers';
import Icon from './Icon';
import { log } from './lib/log';
import { lookupAddress } from './external-apis/InjectedWeb3API';
import {
    prersonalSign,
    requestAccounts,
} from './external-apis/InjectedWeb3API';
import {
    getPublicKey,
    requestChallenge,
    submitSignedChallenge,
} from './external-apis/BackendAPI';

interface SignInProps {
    apiConnection: ApiConnection;
    changeApiConnection: (newApiConnection: Partial<ApiConnection>) => void;
    setEnsNames: (ensNames: Map<string, string>) => void;
    ensNames: Map<string, string>;
}

export function showSignIn(connectionState: ConnectionState): boolean {
    return (
        connectionState === ConnectionState.AccountConntectReady ||
        connectionState === ConnectionState.SignInReady ||
        connectionState === ConnectionState.WaitingForAccountConntection ||
        connectionState === ConnectionState.WaitingForSignIn ||
        connectionState === ConnectionState.AccountConnectionRejected ||
        connectionState === ConnectionState.SignInFailed
    );
}

function SignIn(props: SignInProps) {
    const connect = async () => {
        props.changeApiConnection({
            connectionState: ConnectionState.WaitingForAccountConntection,
        });
        const accountConnection = await connectAccount(
            props.apiConnection.provider as ethers.providers.JsonRpcProvider,
            requestAccounts,
        );

        if (accountConnection.account) {
            props.changeApiConnection({
                account: {
                    address: accountConnection.account,
                    publicKey: await getPublicKey(accountConnection.account),
                },
                connectionState: accountConnection.connectionState,
            });

            const ensName = await lookupAddress(
                props.apiConnection
                    .provider as ethers.providers.JsonRpcProvider,
                accountConnection.account,
            );
            if (ensName) {
                props.setEnsNames(
                    new Map(
                        props.ensNames.set(accountConnection.account, ensName),
                    ),
                );
            }
        } else {
            props.changeApiConnection({
                connectionState: accountConnection.connectionState,
            });
        }
    };

    const requestSignIn = async () => {
        props.changeApiConnection({
            connectionState: ConnectionState.WaitingForSignIn,
        });

        const singInRequest = await signIn(
            props.apiConnection.provider as ethers.providers.JsonRpcProvider,
            (props.apiConnection.account as Account).address,
            requestChallenge,
            prersonalSign,
            submitSignedChallenge,
        );

        if (singInRequest.sessionToken) {
            log(`Setting session token: ${singInRequest.sessionToken}`);
            props.changeApiConnection({
                sessionToken: singInRequest.sessionToken,
                connectionState: singInRequest.connectionState,
            });
        } else {
            props.changeApiConnection({
                connectionState: singInRequest.connectionState,
            });
        }
    };

    const getConnectionIconClass = (connectionState: ConnectionState) => {
        switch (connectionState) {
            case ConnectionState.AccountConnectionRejected:
                return <Icon iconClass="fas fa-exclamation-circle" />;

            case ConnectionState.WaitingForAccountConntection:
                return <Icon iconClass="fas fa-spinner fa-spin" />;

            case ConnectionState.SignInFailed:
            case ConnectionState.SignedIn:
            case ConnectionState.WaitingForSignIn:
            case ConnectionState.SignInReady:
                return <Icon iconClass="fas fa-check-circle" />;

            default:
                return null;
        }
    };

    const getSignInIconClass = (connectionState: ConnectionState) => {
        switch (connectionState) {
            case ConnectionState.SignInFailed:
                return <Icon iconClass="fas fa-exclamation-circle" />;
            case ConnectionState.SignedIn:
                return <Icon iconClass="fas fa-check-circle" />;
            case ConnectionState.WaitingForSignIn:
                return <Icon iconClass="fas fa-spinner fa-spin" />;
            default:
                return null;
        }
    };

    return (
        <div className="row d-flex justify-content-center ">
            <div className="col-md-12 row-space">
                <div className="row">
                    <div className="col-md-12">
                        <button
                            onClick={connect}
                            type="button"
                            className={`btn btn-${
                                props.apiConnection.connectionState ===
                                ConnectionState.AccountConnectionRejected
                                    ? 'danger'
                                    : 'primary'
                            } btn-lg w-100`}
                            disabled={
                                !(
                                    props.apiConnection.connectionState ===
                                        ConnectionState.AccountConntectReady ||
                                    props.apiConnection.connectionState ===
                                        ConnectionState.AccountConnectionRejected
                                )
                            }
                        >
                            Connect Account
                            <span className="push-end">
                                {getConnectionIconClass(
                                    props.apiConnection.connectionState,
                                )}
                            </span>
                        </button>
                    </div>
                </div>
                <div className="row row-space">
                    <div className="col-md-12">
                        <button
                            onClick={requestSignIn}
                            type="button"
                            className={`btn btn-${
                                props.apiConnection.connectionState ===
                                ConnectionState.SignInFailed
                                    ? 'danger'
                                    : 'primary'
                            } btn-lg w-100`}
                            disabled={
                                !(
                                    props.apiConnection.connectionState ===
                                        ConnectionState.SignInReady ||
                                    props.apiConnection.connectionState ===
                                        ConnectionState.SignInFailed
                                )
                            }
                        >
                            Sign In
                            <span className="push-end">
                                {getSignInIconClass(
                                    props.apiConnection.connectionState,
                                )}
                            </span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default SignIn;
