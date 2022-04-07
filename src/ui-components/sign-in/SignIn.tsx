import React, { useContext, useEffect, useState } from 'react';
import './SignIn.css';
import * as Lib from '../../lib';
import StorageLocationSelection from './StorageLocationSelection';
import TokenInput from './TokenInput';
import { GlobalContext } from '../GlobalContextProvider';
import ConnectButton from './ConnectButton';
import ChooseFile from './ChooseFile';
import StoreToken from './StoreToken';
import SignInButton from './SignInButton';
import GoogleConnect, { GoogleAuthState } from './GoogleConnect';
import { ConnectionType } from '../reducers/Connection';
import { connect } from 'http2';

function SignIn() {
    const getStorageLocation = () => {
        const persistedStorageLocation = window.localStorage.getItem(
            'StorageLocation',
        ) as Lib.StorageLocation | null;
        return persistedStorageLocation ?? Lib.StorageLocation.File;
    };

    const [dataFile, setDataFile] = useState<string | undefined>();
    const [token, setToken] = useState<string | undefined>();
    const [storageLocation, setStorageLocation] = useState<Lib.StorageLocation>(
        getStorageLocation(),
    );
    const [googleAuthState, setGoogleAuthState] = useState<GoogleAuthState>(
        GoogleAuthState.Ready,
    );

    const [existingAccount, setExistingAccount] = useState<boolean>(false);
    const [storeApiToken, setStoreApiToken] = useState<boolean>(true);

    const { state, dispatch } = useContext(GlobalContext);

    const initToken = () => {
        if (
            existingAccount &&
            storageLocation === Lib.StorageLocation.Web3Storage
        ) {
            setToken(window.localStorage.getItem('StorageToken') as string);
        }
    };

    const checkState = () => {
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

        const isCollectingSignInData =
            state.connection.connectionState ===
            Lib.ConnectionState.CollectingSignInData;
        const isSignInReady =
            state.connection.connectionState ===
            Lib.ConnectionState.SignInReady;

        if (
            storageLocation === Lib.StorageLocation.File &&
            !existingAccount &&
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
            existingAccount &&
            isCollectingSignInData &&
            dataFile
        ) {
            setSignInReady();
        }

        if (
            storageLocation === Lib.StorageLocation.File &&
            existingAccount &&
            isSignInReady
        ) {
            setCollectingInfos();
        } else if (
            !token &&
            storageLocation === Lib.StorageLocation.Web3Storage &&
            isSignInReady
        ) {
            setCollectingInfos();
        } else if (
            storageLocation === Lib.StorageLocation.File &&
            existingAccount &&
            isSignInReady &&
            !dataFile
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
    }, [storageLocation, existingAccount]);

    useEffect(checkState, [
        storageLocation,
        existingAccount,
        token,
        dataFile,
        state.connection.account,
    ]);

    useEffect(() => {
        if (existingAccount && !storeApiToken) {
            setToken('');
            window.localStorage.removeItem('StorageToken');
        }
    }, [storeApiToken]);

    return (
        <div className="w-100">
            <div className="row d-flex justify-content-center row-space ">
                <div className="col-md-12">
                    <ConnectButton setExistingAccount={setExistingAccount} />

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
                        existingAccount={existingAccount}
                        setDataFile={setDataFile}
                        storageLocation={storageLocation}
                    />
                    <TokenInput
                        existingAccount={existingAccount}
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
                    <SignInButton
                        dataFile={dataFile}
                        existingAccount={existingAccount}
                        storageLocation={storageLocation}
                        storeApiToken={storeApiToken}
                        token={token}
                    />
                </div>
            </div>
        </div>
    );
}

export default SignIn;
