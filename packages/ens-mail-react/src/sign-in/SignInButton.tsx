import React, { useContext } from 'react';
import './SignIn.css';
import * as Lib from 'ens-mail-lib';
import { GlobalContext } from '../GlobalContextProvider';
import { ConnectionType } from '../reducers/Connection';
import { UserDbType } from '../reducers/UserDB';
import localforage from 'localforage';
import StateButton, { ButtonState } from '../ui-shared/StateButton';

interface SignInButtonProps {
    storageLocation: Lib.StorageLocation;
    token: string | undefined;
    storeApiToken: boolean;
    dataFile: string | undefined;
}

function SignInButton(props: SignInButtonProps) {
    const { state, dispatch } = useContext(GlobalContext);

    const requestSignIn = async () => {
        dispatch({
            type: ConnectionType.ChangeConnectionState,
            payload: Lib.ConnectionState.WaitingForSignIn,
        });

        let data = props.dataFile;

        const account: Lib.Account = {
            address: state.connection.account!.address,
        };

        let browserDataFile: Lib.UserStorage | undefined | null = state.uiState
            .proflieExists
            ? await localforage.getItem(
                  Lib.getBrowserStorageKey(account.address),
              )
            : null;

        let preLoadedKey: string | undefined;
        let overwriteUserDb: Partial<Lib.UserDB> = {};

        if (state.uiState.proflieExists) {
            switch (props.storageLocation) {
                case Lib.StorageLocation.Web3Storage:
                    data = state.uiState.proflieExists
                        ? await Lib.web3Load(props.token as string)
                        : undefined;
                    break;

                case Lib.StorageLocation.GoogleDrive:
                    data = state.uiState.proflieExists
                        ? await Lib.googleLoad((window as any).gapi)
                        : undefined;
                    break;

                case Lib.StorageLocation.EnsMailStorage:
                    let authToken;
                    if (browserDataFile) {
                        const browserUserStorage = await Lib.load(
                            state.connection,
                            browserDataFile,
                        );
                        preLoadedKey =
                            browserUserStorage.keys.storageEncryptionKey;
                        authToken = browserUserStorage.deliveryServiceToken;
                    } else {
                        authToken = await Lib.reAuth(state.connection);
                        overwriteUserDb = {
                            deliveryServiceToken: authToken,
                        };
                        browserDataFile = undefined;
                    }

                    try {
                        data = state.uiState.proflieExists
                            ? await Lib.getEnsMailStorage(
                                  state.connection,
                                  authToken,
                              )
                            : undefined;
                    } catch (e) {
                        if (
                            (e as Error).message.includes(
                                'Request failed with status code 401',
                            )
                        ) {
                            const newToken = await Lib.reAuth(state.connection);
                            data = state.uiState.proflieExists
                                ? await Lib.getEnsMailStorage(
                                      state.connection,
                                      newToken,
                                  )
                                : undefined;
                            overwriteUserDb = {
                                deliveryServiceToken: newToken,
                            };

                            browserDataFile = undefined;
                        } else {
                            throw e;
                        }
                    }

                    break;
            }
        }

        if (state.uiState.proflieExists && !browserDataFile && !data) {
            dispatch({
                type: ConnectionType.ChangeConnectionState,
                payload: Lib.ConnectionState.SignInFailed,
            });
        } else {
            const singInRequest = await Lib.signIn(
                state.connection,
                browserDataFile ? browserDataFile : undefined,
                data,
                overwriteUserDb,
                preLoadedKey,
            );

            if (singInRequest.db) {
                Lib.log(`Setting session token`);

                account.publicKeys = Lib.extractPublicKeys(
                    singInRequest.db.keys,
                );

                if (
                    props.token &&
                    props.storeApiToken &&
                    props.storageLocation === Lib.StorageLocation.Web3Storage
                ) {
                    window.localStorage.setItem('StorageToken', props.token);
                }

                window.localStorage.setItem(
                    'StorageLocation',
                    props.storageLocation,
                );

                dispatch({
                    type: ConnectionType.ChangeAccount,
                    payload: account,
                });
                dispatch({
                    type: ConnectionType.ChangeStorageLocation,
                    payload: props.storageLocation,
                });
                dispatch({
                    type: ConnectionType.ChangeStorageToken,
                    payload: props.token,
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
        }
    };

    const getButtonState = (connectionState: Lib.ConnectionState) => {
        switch (connectionState) {
            case Lib.ConnectionState.SignInFailed:
                return ButtonState.Failed;
            case Lib.ConnectionState.SignedIn:
                return ButtonState.Success;
            case Lib.ConnectionState.WaitingForSignIn:
                return ButtonState.Loading;
            case Lib.ConnectionState.SignInReady:
                return ButtonState.Idel;
            default:
                return ButtonState.Disabled;
        }
    };

    return (
        <div className="row row-space">
            <div className="col-md-5">
                <StateButton
                    btnState={getButtonState(state.connection.connectionState)}
                    btnType="primary"
                    onClick={requestSignIn}
                    content={<>Sign In</>}
                />
            </div>
            <div className="col-md-7 help-text"></div>
        </div>
    );
}

export default SignInButton;
