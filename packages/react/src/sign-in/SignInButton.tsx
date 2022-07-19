import React, { useContext } from 'react';
import './SignIn.css';
import * as Lib from 'dm3-lib';
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
    miniSignIn: boolean;
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

        let browserDataFile: Lib.UserStorage | undefined | null =
            state.uiState.proflieExists && state.uiState.browserStorageBackup
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

                case Lib.StorageLocation.dm3Storage:
                    let authToken = (await localforage.getItem(
                        'ENS_MAIL_AUTH_' + account.address,
                    )) as string;
                    if (!authToken) {
                        authToken = await Lib.reAuth(state.connection);
                        await localforage.setItem(
                            'ENS_MAIL_AUTH_' + account.address,
                            authToken,
                        );

                        browserDataFile = undefined;
                    }

                    try {
                        data = state.uiState.proflieExists
                            ? await Lib.getDm3Storage(
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
                            await localforage.setItem(
                                'ENS_MAIL_AUTH_' + account.address,
                                newToken,
                            );
                            data = state.uiState.proflieExists
                                ? await Lib.getDm3Storage(
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
                    overwriteUserDb = {
                        deliveryServiceToken: authToken,
                    };

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

                account.profile = (
                    await Lib.getProfileRegistryEntry(
                        state.connection,
                        account.address,
                        state.connection.defaultServiceUrl +
                            '/profile/' +
                            account.address,
                    )
                )?.profileRegistryEntry;

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

    const stateButton = (
        <StateButton
            btnState={getButtonState(state.connection.connectionState)}
            btnType="primary"
            onClick={requestSignIn}
            content={<>Sign In</>}
            className={
                props.miniSignIn
                    ? 'left-state-btn miniSignInBtn'
                    : 'left-state-btn mb-4'
            }
        />
    );

    return props.miniSignIn ? (
        stateButton
    ) : (
        <div className="row row-space">
            <div className="col-md-5">{stateButton}</div>
            <div className="col-md-7 help-text"></div>
        </div>
    );
}

export default SignInButton;
