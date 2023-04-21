import localforage from 'localforage';
import { useContext, useEffect, useState } from 'react';
import { GlobalContext } from '../GlobalContextProvider';
import DarkLogo from '../logos/DarkLogo';
import { ConnectionType } from '../reducers/Connection';
import ConnectButton from './ConnectButton';
import { signIn } from './Connectors';
import { GoogleAuthState } from './GoogleConnect';
import './SignIn.css';
import { StorageLocation } from 'dm3-lib-storage';
import { getBrowserStorageKey } from 'dm3-lib-profile';
import { ConnectionState } from '../web3provider/Web3Provider';

interface SignInProps {
    hideStorageSelection: boolean;
    miniSignIn: boolean;
    defaultStorageLocation: StorageLocation | undefined;
}

function SignIn(props: SignInProps) {
    const getStorageLocation = () => {
        const persistedStorageLocation = window.localStorage.getItem(
            'StorageLocation',
        ) as StorageLocation | null;

        return (
            props.defaultStorageLocation ??
            persistedStorageLocation ??
            StorageLocation.File
        );
    };

    const [dataFile, setDataFile] = useState<string | undefined>();
    const [token, setToken] = useState<string | undefined>();
    const [storageLocation, setStorageLocation] = useState<StorageLocation>(
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
            storageLocation === StorageLocation.Web3Storage
        ) {
            setToken(window.localStorage.getItem('StorageToken') as string);
        }
    };

    const checkState = async () => {
        const setAccountConntectReady = () =>
            dispatch({
                type: ConnectionType.ChangeConnectionState,
                payload: ConnectionState.AccountConntectReady,
            });

        const setCollectingInfos = () =>
            dispatch({
                type: ConnectionType.ChangeConnectionState,
                payload: ConnectionState.CollectingSignInData,
            });

        const browserDataFile =
            state.connection.account && state.uiState.browserStorageBackup
                ? await localforage.getItem(
                      getBrowserStorageKey(state.connection.account.ensName),
                  )
                : null;

        const isCollectingSignInData =
            state.connection.connectionState ===
            ConnectionState.CollectingSignInData;
        const isSignInReady =
            state.connection.connectionState ===
            ConnectionState.SignInReady;

        if (
            storageLocation === StorageLocation.File &&
            !state.uiState.proflieExists &&
            isCollectingSignInData
        ) {
            setAccountConntectReady();
        } else if (
            token &&
            storageLocation === StorageLocation.Web3Storage &&
            isCollectingSignInData
        ) {
            setAccountConntectReady();
        } else if (
            storageLocation === StorageLocation.File &&
            state.uiState.proflieExists &&
            isCollectingSignInData &&
            (dataFile || browserDataFile)
        ) {
            setAccountConntectReady();
        } else if (
            storageLocation === StorageLocation.dm3Storage &&
            isCollectingSignInData
        ) {
            setAccountConntectReady();
        }

        if (
            storageLocation === StorageLocation.File &&
            state.uiState.proflieExists &&
            isSignInReady
        ) {
            setAccountConntectReady();
        } else if (
            !token &&
            storageLocation === StorageLocation.Web3Storage &&
            isSignInReady
        ) {
            setCollectingInfos();
        } else if (
            storageLocation === StorageLocation.GoogleDrive &&
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
                ConnectionState.SignInReady &&
            state.connection.ethAddress
        ) {
            signIn(storageLocation, token, state, dispatch);
        }
    }, [state.connection.connectionState, state.connection.ethAddress]);

    return (
        <div className="w-100 d-flex flex-column align-items-center sign-in-main h-100">
            <div className="d-flex justify-content-center sign-in-logo">
                <DarkLogo />
            </div>
            <div className="d-flex justify-content-center mb-4">
                <div className="d-flex justify-content-center">
                    <ConnectButton miniSignIn={props.miniSignIn} />
                </div>
            </div>
            <div className="d-flex justify-content-center mt-4">
                <div className="m-4 p-4 help-text text-center">
                    <p>Connect the dm3 app with your wallet. </p>
                    <p>
                        Keys for secure communication are derived from the
                        signature.
                    </p>
                    <p>No paid transaction will be executed.</p>
                </div>
            </div>
        </div>
    );
}

export default SignIn;
