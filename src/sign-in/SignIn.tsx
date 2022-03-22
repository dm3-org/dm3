import React, { useContext, useState } from 'react';
import { ethers } from 'ethers';
import Icon from '../ui-shared/Icon';
import * as Lib from '../lib';
import StorageLocationSelection from './StorageLocationSelection';
import { connectionPhase } from './Phases';
import TokenInput from './TokenInput';
import { GlobalContext } from '../GlobalContextProvider';
import { EnsNameType } from '../reducers/EnsNames';
import { UserDbType } from '../reducers/UserDB';
import { ConnectionType } from '../reducers/Connection';

function SignIn() {
    const [dataFile, setDataFile] = useState<string | undefined>();
    const [token, setToken] = useState<string | undefined>();
    const [storageLocation, setStorageLocation] = useState<Lib.StorageLocation>(
        Lib.StorageLocation.File,
    );
    const [existingAccount, setExistingAccount] = useState<boolean>(false);

    const { state, dispatch } = useContext(GlobalContext);

    const connect = async () => {
        dispatch({
            type: ConnectionType.ChangeConnectionState,
            payload: Lib.ConnectionState.WaitingForAccountConntection,
        });

        const accountConnection = await Lib.connectAccount(
            state.connection.provider!,
        );

        setExistingAccount(accountConnection.existingAccount);

        if (accountConnection.account) {
            dispatch({
                type: ConnectionType.ChangeAccount,
                payload: {
                    address: accountConnection.account,
                },
            });
            dispatch({
                type: ConnectionType.ChangeConnectionState,
                payload: accountConnection.connectionState,
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

    const requestSignIn = async () => {
        dispatch({
            type: ConnectionType.ChangeConnectionState,
            payload: Lib.ConnectionState.WaitingForSignIn,
        });

        const data =
            storageLocation === Lib.StorageLocation.Web3Storage
                ? existingAccount
                    ? await Lib.web3Load(token as string)
                    : undefined
                : dataFile;

        const singInRequest = await Lib.signIn(state.connection, data);

        if (singInRequest.db) {
            Lib.log(`Setting session token`);

            const account: Lib.Account = {
                address: state.connection.account!.address,
            };

            account.publicKeys = Lib.extractPublicKeys(singInRequest.db.keys);

            dispatch({ type: ConnectionType.ChangeAccount, payload: account });
            dispatch({
                type: ConnectionType.ChangeStorageLocation,
                payload: storageLocation,
            });
            dispatch({
                type: ConnectionType.ChangeStorageToken,
                payload: token,
            });
            dispatch({ type: UserDbType.setDB, payload: singInRequest.db });
            dispatch({
                type: ConnectionType.ChangeConnectionState,
                payload: singInRequest.connectionState,
            });
        }
        dispatch({
            type: ConnectionType.ChangeConnectionState,
            payload: singInRequest.connectionState,
        });
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
                    setDataFile(e.target?.result as string);
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
                                    state.connection.connectionState ===
                                    Lib.ConnectionState
                                        .AccountConnectionRejected
                                        ? 'danger'
                                        : 'primary'
                                } btn-lg w-100`}
                                disabled={
                                    !(
                                        state.connection.connectionState ===
                                            Lib.ConnectionState
                                                .AccountConntectReady ||
                                        state.connection.connectionState ===
                                            Lib.ConnectionState
                                                .AccountConnectionRejected
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
                    </div>

                    {!connectionPhase(state.connection.connectionState) && (
                        <StorageLocationSelection
                            setStorageLocation={setStorageLocation}
                            stroageLocation={storageLocation}
                        />
                    )}
                    {existingAccount &&
                        storageLocation === Lib.StorageLocation.File && (
                            <div className="row row-space">
                                <div className="col-md-12">
                                    <input
                                        type="file"
                                        className="form-control"
                                        onChange={(event) => upload(event)}
                                    />
                                </div>
                            </div>
                        )}
                    {!connectionPhase(state.connection.connectionState) &&
                        storageLocation === Lib.StorageLocation.Web3Storage && (
                            <TokenInput setToken={setToken} token={token} />
                        )}
                    {!connectionPhase(state.connection.connectionState) && (
                        <div className="row row-space">
                            <div className="col-md-12">
                                <button
                                    onClick={requestSignIn}
                                    type="button"
                                    className={`btn btn-${
                                        state.connection.connectionState ===
                                        Lib.ConnectionState.SignInFailed
                                            ? 'danger'
                                            : 'primary'
                                    } btn-lg w-100`}
                                    disabled={
                                        !(
                                            state.connection.connectionState ===
                                                Lib.ConnectionState
                                                    .SignInReady ||
                                            state.connection.connectionState ===
                                                Lib.ConnectionState.SignInFailed
                                        ) ||
                                        (existingAccount &&
                                            !dataFile &&
                                            storageLocation ===
                                                Lib.StorageLocation.File) ||
                                        (existingAccount &&
                                            !token &&
                                            storageLocation ===
                                                Lib.StorageLocation.Web3Storage)
                                    }
                                >
                                    Sign In
                                    <span className="push-end">
                                        {getSignInIconClass(
                                            state.connection.connectionState,
                                        )}
                                    </span>
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default SignIn;
