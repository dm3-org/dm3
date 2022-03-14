import React, { useEffect } from 'react';
import { ethers } from 'ethers';
import Icon from '../ui-shared/Icon';
import * as Lib from '../lib';

interface SignInProps {
    connection: Lib.Connection;
    changeConnection: (newConnection: Partial<Lib.Connection>) => void;
    setEnsNames: (ensNames: Map<string, string>) => void;
    ensNames: Map<string, string>;
    setDataFile: (fileContent: string) => void;
}

export function showSignIn(connectionState: Lib.ConnectionState): boolean {
    return (
        connectionState === Lib.ConnectionState.AccountConntectReady ||
        connectionState === Lib.ConnectionState.SignInReady ||
        connectionState === Lib.ConnectionState.WaitingForAccountConntection ||
        connectionState === Lib.ConnectionState.WaitingForSignIn ||
        connectionState === Lib.ConnectionState.AccountConnectionRejected ||
        connectionState === Lib.ConnectionState.SignInFailed
    );
}

function SignIn(props: SignInProps) {
    const connect = async () => {
        props.changeConnection({
            connectionState: Lib.ConnectionState.WaitingForAccountConntection,
        });
        const accountConnection = await Lib.connectAccount(
            props.connection.provider as ethers.providers.JsonRpcProvider,
        );

        if (accountConnection.account) {
            props.changeConnection({
                account: {
                    address: accountConnection.account,
                },
                connectionState: accountConnection.connectionState,
            });

            const ensName = await Lib.lookupAddress(
                props.connection.provider as ethers.providers.JsonRpcProvider,
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
            props.changeConnection({
                connectionState: accountConnection.connectionState,
            });
        }
    };

    const requestSignIn = async () => {
        props.changeConnection({
            connectionState: Lib.ConnectionState.WaitingForSignIn,
        });

        const singInRequest = await Lib.signIn(
            props.connection.provider as ethers.providers.JsonRpcProvider,
            (props.connection.account as Lib.Account).address,
        );

        if (singInRequest.sessionToken) {
            Lib.log(`Setting session token: ${singInRequest.sessionToken}`);

            props.changeConnection({
                account: {
                    address: props.connection.account?.address as string,
                    keys: singInRequest.keys,
                },
                sessionToken: singInRequest.sessionToken,
                connectionState: singInRequest.connectionState,
            });
        } else {
            props.changeConnection({
                connectionState: singInRequest.connectionState,
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
            case Lib.ConnectionState.SignInReady:
                return <Icon iconClass="fas fa-check-circle" />;

            default:
                return null;
        }
    };

    const getSignInIconClass = (connectionState: Lib.ConnectionState) => {
        switch (connectionState) {
            case Lib.ConnectionState.SignInFailed:
                return <Icon iconClass="fas fa-exclamation-circle" />;
            case Lib.ConnectionState.SignedIn:
                return <Icon iconClass="fas fa-check-circle" />;
            case Lib.ConnectionState.WaitingForSignIn:
                return <Icon iconClass="fas fa-spinner fa-spin" />;
            default:
                return null;
        }
    };

    const upload = (event: any) => {
        if (event.target.files[0]) {
            const file = event.target.files[0];
            const reader = new FileReader();
            reader.onload = (e) => {
                if (e.target) {
                    props.setDataFile(e.target?.result as string);
                }
            };
            reader.readAsText(file);
        }
    };

    return (
        <div className="w-100">
            <div className="row d-flex justify-content-center ">
                <div className="col-md-12 row-space">
                    <div className="row">
                        <div className="col-md-12">
                            <button
                                onClick={connect}
                                type="button"
                                className={`btn btn-${
                                    props.connection.connectionState ===
                                    Lib.ConnectionState
                                        .AccountConnectionRejected
                                        ? 'danger'
                                        : 'primary'
                                } btn-lg w-100`}
                                disabled={
                                    !(
                                        props.connection.connectionState ===
                                            Lib.ConnectionState
                                                .AccountConntectReady ||
                                        props.connection.connectionState ===
                                            Lib.ConnectionState
                                                .AccountConnectionRejected
                                    )
                                }
                            >
                                Connect Account
                                <span className="push-end">
                                    {getConnectionIconClass(
                                        props.connection.connectionState,
                                    )}
                                </span>
                            </button>
                        </div>
                    </div>
                    <div className="row row-space">
                        <div className="col-md-12">
                            <input
                                type="file"
                                className="form-control"
                                onChange={(event) => upload(event)}
                                disabled={
                                    !(
                                        props.connection.connectionState ===
                                            Lib.ConnectionState.SignInReady ||
                                        props.connection.connectionState ===
                                            Lib.ConnectionState.SignInFailed
                                    )
                                }
                            />
                        </div>
                    </div>
                    <div className="row row-space">
                        <div className="col-md-12">
                            <button
                                onClick={requestSignIn}
                                type="button"
                                className={`btn btn-${
                                    props.connection.connectionState ===
                                    Lib.ConnectionState.SignInFailed
                                        ? 'danger'
                                        : 'primary'
                                } btn-lg w-100`}
                                disabled={
                                    !(
                                        props.connection.connectionState ===
                                            Lib.ConnectionState.SignInReady ||
                                        props.connection.connectionState ===
                                            Lib.ConnectionState.SignInFailed
                                    )
                                }
                            >
                                Sign In
                                <span className="push-end">
                                    {getSignInIconClass(
                                        props.connection.connectionState,
                                    )}
                                </span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default SignIn;
