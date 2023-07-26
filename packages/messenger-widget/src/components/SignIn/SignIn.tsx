import './SignIn.css';
import dm3Logo from '../../assets/images/dm3-logo.png';
import { homeImage } from '../../assets/base64/home-image';
import { useContext, useEffect, useState } from 'react';
import { SignInProps } from '../../interfaces/web3';
import { StorageLocation } from 'dm3-lib-storage';
import { GlobalContext } from '../../utils/context-utils';
import {
    ConnectionState,
    GoogleAuthState,
    SignInBtnValues,
} from '../../utils/enum-type-utils';
import {
    changeSignInButtonStyle,
    checkState,
    connectAccount,
    getButtonState,
    getIcon,
    getStorageLocation,
    initToken,
    signIn,
} from './bl';

export function SignIn(props: SignInProps) {
    // state to handle button text
    const [signInBtnContent, setSignInBtnContent] = useState(
        SignInBtnValues.SignIn,
    );

    const [dataFile, setDataFile] = useState<string | undefined>();

    // state to handle sign in token
    const [token, setToken] = useState<string | undefined>();

    // state to handle store api token
    const [storeApiToken, setStoreApiToken] = useState<boolean>(true);

    // fetches context api data
    const { state, dispatch } = useContext(GlobalContext);

    // state to handle storage location
    const [storageLocation, setStorageLocation] = useState<StorageLocation>(
        getStorageLocation(props),
    );

    // state to handle google auth
    const [googleAuthState, setGoogleAuthState] = useState<GoogleAuthState>(
        GoogleAuthState.Ready,
    );

    // state to track sign in button is clicked or not
    const [isSignInBtnClicked, setIsSignInBtnClicked] =
        useState<boolean>(false);

    // state to handle the ethereum account connected
    const [accountConnected, setAccountConnected] = useState<any>(null);

    useEffect(() => {
        checkState(
            state,
            dispatch,
            storageLocation,
            token,
            dataFile,
            googleAuthState,
        );
        initToken(state, storageLocation, setToken);
    }, []);

    useEffect(() => {
        initToken(state, storageLocation, setToken);
    }, [storageLocation, state.uiState.proflieExists]);

    useEffect(() => {
        checkState(
            state,
            dispatch,
            storageLocation,
            token,
            dataFile,
            googleAuthState,
        );
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
            state.connection.connectionState === ConnectionState.SignInReady &&
            state.connection.ethAddress
        ) {
            signIn(
                storageLocation,
                token,
                state,
                dispatch,
                setSignInBtnContent,
            );
        }
    }, [state.connection.connectionState, state.connection.ethAddress]);

    useEffect(() => {
        if (
            state.connection.provider &&
            state.connection.connectionState ===
                ConnectionState.AccountConnectReady
        ) {
            connectAccount(state, dispatch);
        }
    }, [state.connection.provider, state.connection.connectionState]);

    // handle sign in button click
    const handleSignIn = async () => {
        if (accountConnected && accountConnected.address) {
            setIsSignInBtnClicked(true);
        } else {
            changeSignInButtonStyle(
                'sign-in-btn',
                'normal-btn',
                'normal-btn-hover',
            );
        }
    };

    return (
        <>
            <div className="row p-4">
                <div className="col-lg-6 col-md-6 col-sm-12 p-0 home-image-container background-container">
                    <img
                        src={homeImage}
                        className="img-fluid h-100 w-100 home-image"
                    />
                </div>
                {/*  eslint-disable */}
                <div className="col-lg-6 col-md-6 col-sm-12 p-0 d-flex flex-column justify-content-center signin-container background-container">
                    <div className="d-flex flex-column justify-content-center height-fill content-data-container">
                        <div className="d-flex flex-column justify-content-center">
                            <img
                                className="w-100 h-auto"
                                src={dm3Logo}
                                alt="DM3 logo"
                            />
                        </div>

                        <br />

                        <div>
                            <div className="encrypted-details font-weight-800 font-size-12 text-primary-color">
                                web3 messaging.
                                <p className="encrypted-details font-weight-400 font-size-12 text-primary-color">
                                    encrypted. private. decentralized.
                                    interoperable.
                                </p>
                            </div>
                        </div>

                        <br />

                        <div className="content-data">
                            <button
                                id="sign-in-btn"
                                disabled={
                                    signInBtnContent !== SignInBtnValues.SignIn
                                }
                                /* eslint-disable */
                                className="signin-btn w-100 font-weight-400 border-radius-4 normal-btn text-primary-color normal-btn-border"
                                onClick={() => handleSignIn()}
                            >
                                {signInBtnContent === SignInBtnValues.SigningIn
                                    ? SignInBtnValues.SignIn
                                    : signInBtnContent}
                                {signInBtnContent ===
                                    SignInBtnValues.SigningIn && (
                                    <span className="right-float">
                                        {getIcon(
                                            getButtonState(
                                                state.connection
                                                    .connectionState,
                                            ),
                                        )}
                                    </span>
                                )}
                            </button>
                        </div>

                        <br />

                        <div className="para-div">
                            <p className="text-primary-color details font-size-12">
                                Connect the dm3 messenger with your wallet and
                                sign in with a signature. No need for a username
                                or password.
                            </p>
                            <p className="text-primary-color details font-size-12">
                                Keys for secure and private communication are
                                derived from this signature.
                            </p>
                            <p className="text-primary-color details font-size-12">
                                No paid transaction will be executed.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
