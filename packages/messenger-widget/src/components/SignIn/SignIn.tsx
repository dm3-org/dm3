/* eslint-disable max-len */
/* eslint-disable no-console */
import { ConnectButton, useConnectModal } from '@rainbow-me/rainbowkit';
import { useContext } from 'react';
import { useAccount } from 'wagmi';
import { homeImage } from '../../assets/base64/home-image';
import dm3Logo from '../../assets/images/dm3-logo.png';
import { AuthContext } from '../../context/AuthContext';
import { SignInProps } from '../../interfaces/web3';
import { ButtonState } from '../../utils/enum-type-utils';
import { LoginButton } from './LoginButton';
import './SignIn.css';
import { changeSignInButtonStyle } from './bl';

export function SignIn(props: SignInProps) {
    const { address, isConnecting, isDisconnected, isConnected } = useAccount();

    const { cleanSignIn, isLoggedIn, isLoading } = useContext(AuthContext);

    // open rainbow wallet modal function
    const { openConnectModal } = useConnectModal();

    const handleConnectWithWallet = () => {
        openConnectionModal();
    };

    const handleSignIn = async () => {
        cleanSignIn();
    };

    // method to open connection modal
    const openConnectionModal = () => {
        changeSignInButtonStyle(
            'sign-in-btn',
            'normal-btn',
            'normal-btn-hover',
        );
        openConnectModal && openConnectModal();
    };

    return (
        <>
            <div className="row m-0 p-0 h-100">
                <div className="h-100 col-lg-7 col-md-7 col-sm-12 p-0 home-image-container background-container">
                    <img
                        src={homeImage}
                        className="img-fluid home-image w-100"
                    />
                </div>
                <div
                    className="h-100 col-lg-5 col-md-5 col-sm-12 p-0 d-flex flex-column 
                justify-content-center signin-container background-container"
                >
                    <div className="d-flex justify-content-end rainbow-connect-btn">
                        {isConnected ? (
                            <ConnectButton showBalance={false} />
                        ) : (
                            <div className="mt-1 normal-btn wal-not-connected">
                                Wallet not connected
                            </div>
                        )}
                    </div>
                    <div className="d-flex flex-column justify-content-center height-fill content-data-container">
                        <div className="d-flex flex-column justify-content-center">
                            <img
                                className="h-auto sign-in-logo"
                                src={dm3Logo}
                                alt="DM3 logo"
                            />
                        </div>

                        <div className="mt-4">
                            <div className="encrypted-details font-weight-800 font-size-12 text-primary-color">
                                web3 messaging.
                                <p className="encrypted-details font-weight-400 font-size-12 text-primary-color">
                                    encrypted. private. decentralized.
                                    interoperable.
                                </p>
                            </div>
                        </div>

                        {isConnecting && (
                            <p style={{ color: 'white' }}>Connecting</p>
                        )}

                        {!isConnected ? (
                            <LoginButton
                                text="Connect with Wallett"
                                onClick={handleConnectWithWallet}
                                buttonState={ButtonState.Ideal}
                            />
                        ) : (
                            <LoginButton
                                disabled={isLoading}
                                text={isLoading ? 'Loading' : 'Sign In'}
                                onClick={handleSignIn}
                                buttonState={
                                    isLoading
                                        ? ButtonState.Loading
                                        : ButtonState.Ideal
                                }
                            />
                        )}

                        {isLoggedIn ? (
                            <p style={{ color: 'white' }}>logged in</p>
                        ) : (
                            <p style={{ color: 'white' }}>
                                NOOOO: {isLoggedIn} ftgt
                            </p>
                        )}

                        <div className="content-data para-div">
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
