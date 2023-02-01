import React, { useContext, useEffect, useState } from 'react';
import './SignIn.css';
import * as Lib from 'dm3-lib';
import StorageLocationSelection from './StorageLocationSelection';
import TokenInput from './TokenInput';
import { GlobalContext } from '../GlobalContextProvider';
import ConnectButton from './ConnectButton';
import ChooseFile from './ChooseFile';
import StoreToken from './StoreToken';
import GoogleConnect, { GoogleAuthState } from './GoogleConnect';
import { ConnectionType } from '../reducers/Connection';
import localforage from 'localforage';
import DarkLogo from '../logos/DarkLogo';
import { signIn } from './Connectors';
import { UserDbType } from '../reducers/UserDB';

interface SignInProps {
    hideStorageSelection: boolean;
    miniSignIn: boolean;
    defaultStorageLocation: Lib.storage.StorageLocation | undefined;
}

function SignIn(props: SignInProps) {
    const getStorageLocation = () => {
        const persistedStorageLocation = window.localStorage.getItem(
            'StorageLocation',
        ) as Lib.storage.StorageLocation | null;

        return (
            props.defaultStorageLocation ??
            persistedStorageLocation ??
            Lib.storage.StorageLocation.File
        );
    };

    const [dataFile, setDataFile] = useState<string | undefined>();
    const [token, setToken] = useState<string | undefined>();
    const [storageLocation, setStorageLocation] =
        useState<Lib.storage.StorageLocation>(getStorageLocation());
    const [googleAuthState, setGoogleAuthState] = useState<GoogleAuthState>(
        GoogleAuthState.Ready,
    );

    const [storeApiToken, setStoreApiToken] = useState<boolean>(true);

    const { state, dispatch } = useContext(GlobalContext);

    const initToken = () => {
        if (
            state.uiState.proflieExists &&
            storageLocation === Lib.storage.StorageLocation.Web3Storage
        ) {
            setToken(window.localStorage.getItem('StorageToken') as string);
        }
    };

    const checkState = async () => {
        const setAccountConntectReady = () =>
            dispatch({
                type: ConnectionType.ChangeConnectionState,
                payload: Lib.web3provider.ConnectionState.AccountConntectReady,
            });

        const setCollectingInfos = () =>
            dispatch({
                type: ConnectionType.ChangeConnectionState,
                payload: Lib.web3provider.ConnectionState.CollectingSignInData,
            });

        const browserDataFile =
            state.connection.account && state.uiState.browserStorageBackup
                ? await localforage.getItem(
                      Lib.account.getBrowserStorageKey(
                          state.connection.account.ensName,
                      ),
                  )
                : null;

        const isCollectingSignInData =
            state.connection.connectionState ===
            Lib.web3provider.ConnectionState.CollectingSignInData;
        const isSignInReady =
            state.connection.connectionState ===
            Lib.web3provider.ConnectionState.SignInReady;

        if (
            storageLocation === Lib.storage.StorageLocation.File &&
            !state.uiState.proflieExists &&
            isCollectingSignInData
        ) {
            setAccountConntectReady();
        } else if (
            token &&
            storageLocation === Lib.storage.StorageLocation.Web3Storage &&
            isCollectingSignInData
        ) {
            setAccountConntectReady();
        } else if (
            storageLocation === Lib.storage.StorageLocation.File &&
            state.uiState.proflieExists &&
            isCollectingSignInData &&
            (dataFile || browserDataFile)
        ) {
            setAccountConntectReady();
        } else if (
            storageLocation === Lib.storage.StorageLocation.dm3Storage &&
            isCollectingSignInData
        ) {
            setAccountConntectReady();
        }

        if (
            storageLocation === Lib.storage.StorageLocation.File &&
            state.uiState.proflieExists &&
            isSignInReady
        ) {
            setAccountConntectReady();
        } else if (
            !token &&
            storageLocation === Lib.storage.StorageLocation.Web3Storage &&
            isSignInReady
        ) {
            setCollectingInfos();
        } else if (
            storageLocation === Lib.storage.StorageLocation.GoogleDrive &&
            isSignInReady &&
            googleAuthState !== GoogleAuthState.Success
        ) {
            setCollectingInfos();
        }
    };

    useEffect(() => {
        checkState();
        initToken();
    }, []);

    useEffect(() => {
        initToken();
    }, [storageLocation, state.uiState.proflieExists]);

    useEffect(() => {
        checkState();
    }, [
        storageLocation,
        state.uiState.proflieExists,
        token,
        dataFile,
        state.connection.account,
    ]);

    useEffect(() => {
        if (state.uiState.proflieExists && !storeApiToken) {
            setToken('');
            window.localStorage.removeItem('StorageToken');
        }
    }, [storeApiToken]);

    useEffect(() => {
        if (
            state.connection.connectionState ===
                Lib.web3provider.ConnectionState.SignInReady &&
            state.connection.ethAddress
        ) {
            signIn(storageLocation, token, state, dispatch);
        }
    }, [state.connection.connectionState, state.connection.ethAddress]);

    return props.miniSignIn ? (
        <div className="w-100  pt-4 pb-4">
            <div className="row  sign-in">
                <div className="col-md-12">
                    <div className="d-flex">
                        <div className="d-flex align-content-center me-auto ">
                            <DarkLogo />
                        </div>

                        <div className="ms-4 align-self-center me-2">
                            <ConnectButton miniSignIn={props.miniSignIn} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    ) : (
        <div className="w-100 d-flex flex-column">
            <div className="row d-flex justify-content-center row-space sign-in me-2">
                <div className="col-md-12">
                    {!props.hideStorageSelection && (
                        <>
                            <StorageLocationSelection
                                setStorageLocation={setStorageLocation}
                                stroageLocation={storageLocation}
                            />
                            <GoogleConnect
                                googleAuthState={googleAuthState}
                                setGoogleAuthState={setGoogleAuthState}
                                storageLocation={storageLocation}
                            />
                            <ChooseFile
                                setDataFile={setDataFile}
                                storageLocation={storageLocation}
                            />
                            <TokenInput
                                setToken={setToken}
                                storageLocation={storageLocation}
                                storeApiToken={storeApiToken}
                                token={token}
                            />
                            <StoreToken
                                setStoreApiToken={setStoreApiToken}
                                storageLocation={storageLocation}
                                storeApiToken={storeApiToken}
                            />
                        </>
                    )}
                    <ConnectButton miniSignIn={props.miniSignIn} />
                </div>
            </div>
            <div className="mt-auto mb-3 me-3 align-self-end">
                <DarkLogo />
            </div>
        </div>
    );
}

export default SignIn;
