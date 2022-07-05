import React, { useContext, useEffect, useState } from 'react';
import './SignIn.css';
import * as Lib from 'ens-mail-lib';
import StorageLocationSelection from './StorageLocationSelection';
import TokenInput from './TokenInput';
import { GlobalContext } from '../GlobalContextProvider';
import ConnectButton from './ConnectButton';
import ChooseFile from './ChooseFile';
import StoreToken from './StoreToken';
import SignInButton from './SignInButton';
import GoogleConnect, { GoogleAuthState } from './GoogleConnect';
import { ConnectionType } from '../reducers/Connection';
import localforage from 'localforage';

import Logo from '../assets/ENS-Mail_Logo_blue-white.svg';
import DarkLogo from '../logos/DarkLogo';

interface SignInProps {
    hideStorageSelection: boolean;
    miniSignIn: boolean;
    defaultStorageLocation: Lib.StorageLocation | undefined;
}

function SignIn(props: SignInProps) {
    const getStorageLocation = () => {
        const persistedStorageLocation = window.localStorage.getItem(
            'StorageLocation',
        ) as Lib.StorageLocation | null;

        return (
            persistedStorageLocation ??
            props.defaultStorageLocation ??
            Lib.StorageLocation.File
        );
    };

    const [dataFile, setDataFile] = useState<string | undefined>();
    const [token, setToken] = useState<string | undefined>();
    const [storageLocation, setStorageLocation] = useState<Lib.StorageLocation>(
        getStorageLocation(),
    );
    const [googleAuthState, setGoogleAuthState] = useState<GoogleAuthState>(
        GoogleAuthState.Ready,
    );

    const [storeApiToken, setStoreApiToken] = useState<boolean>(true);

    const { state, dispatch } = useContext(GlobalContext);

    const initToken = () => {
        if (
            state.uiState.proflieExists &&
            storageLocation === Lib.StorageLocation.Web3Storage
        ) {
            setToken(window.localStorage.getItem('StorageToken') as string);
        }
    };

    const checkState = async () => {
        const setSignInReady = () =>
            dispatch({
                type: ConnectionType.ChangeConnectionState,
                payload: Lib.ConnectionState.SignInReady,
            });

        const setCollectingInfos = () =>
            dispatch({
                type: ConnectionType.ChangeConnectionState,
                payload: Lib.ConnectionState.CollectingSignInData,
            });

        const browserDataFile = state.connection.account
            ? await localforage.getItem(
                  Lib.getBrowserStorageKey(state.connection.account.address),
              )
            : null;

        const isCollectingSignInData =
            state.connection.connectionState ===
            Lib.ConnectionState.CollectingSignInData;
        const isSignInReady =
            state.connection.connectionState ===
            Lib.ConnectionState.SignInReady;

        if (
            storageLocation === Lib.StorageLocation.File &&
            !state.uiState.proflieExists &&
            isCollectingSignInData
        ) {
            setSignInReady();
        } else if (
            token &&
            storageLocation === Lib.StorageLocation.Web3Storage &&
            isCollectingSignInData
        ) {
            setSignInReady();
        } else if (
            storageLocation === Lib.StorageLocation.File &&
            state.uiState.proflieExists &&
            isCollectingSignInData &&
            (dataFile || browserDataFile)
        ) {
            setSignInReady();
        } else if (
            storageLocation === Lib.StorageLocation.EnsMailStorage &&
            isCollectingSignInData
        ) {
            setSignInReady();
        }

        if (
            storageLocation === Lib.StorageLocation.File &&
            state.uiState.proflieExists &&
            isSignInReady
        ) {
            setSignInReady();
        } else if (
            !token &&
            storageLocation === Lib.StorageLocation.Web3Storage &&
            isSignInReady
        ) {
            setCollectingInfos();
        } else if (
            storageLocation === Lib.StorageLocation.GoogleDrive &&
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

    return props.miniSignIn ? (
        <div className="w-100  pt-4 pb-4">
            <div className="row  sign-in">
                <div className="col-md-12">
                    <div className="d-flex">
                        <div className="d-flex align-content-center me-auto ">
                            <DarkLogo />
                        </div>
                        <div className="align-self-center">
                            <ConnectButton miniSignIn={props.miniSignIn} />
                        </div>
                        <div className="ms-4 align-self-center me-2">
                            <SignInButton
                                dataFile={dataFile}
                                storageLocation={storageLocation}
                                storeApiToken={storeApiToken}
                                token={token}
                                miniSignIn={props.miniSignIn}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    ) : (
        <div className="w-100">
            <div className="row d-flex justify-content-center row-space sign-in ">
                <div className="col-md-12">
                    <DarkLogo />
                </div>
            </div>
            <div className="row d-flex justify-content-center row-space sign-in ">
                <div className="col-md-12">
                    <ConnectButton miniSignIn={props.miniSignIn} />
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
                    <SignInButton
                        dataFile={dataFile}
                        storageLocation={storageLocation}
                        storeApiToken={storeApiToken}
                        token={token}
                        miniSignIn={props.miniSignIn}
                    />
                </div>
            </div>
        </div>
    );
}

export default SignIn;
