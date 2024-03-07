/* eslint-disable max-len */
/* eslint-disable no-console */
import { ConnectButton, useConnectModal } from '@rainbow-me/rainbowkit';
import { useContext } from 'react';
import { useAccount } from 'wagmi';
import { AuthContext } from '../../context/AuthContext';
import { SignInProps } from '../../interfaces/web3';
import { ButtonState } from '../../utils/enum-type-utils';
import { LoginButton } from './LoginButton';
import './SignIn.css';
import { changeSignInButtonStyle } from './bl';
import DM3Logo from './DM3Logo';
import { signInImage } from '../../assets/base64/home-image';

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
        <div className="signin-container-type h-100">
            <div className="row m-0 p-0 h-100">
                <div
                    style={{
                        backgroundImage: `url(${
                            props.signInImage ?? signInImage
                        })`,
                    }}
                    className="col-lg-7 col-md-7 col-sm-0 p-0 home-image-container background-container"
                ></div>
                <div
                    className="h-100 col-lg-5 col-md-5 col-sm-12 p-0 d-flex flex-column 
                justify-content-center background-container"
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
                            <DM3Logo />
                        </div>

                        <div className="mt-4 w-100">
                            <div className="encrypted-details font-weight-800 font-size-12 text-primary-color">
                                web3 messaging.
                                <p className="encrypted-details font-weight-400 font-size-12 text-primary-color">
                                    encrypted. private. decentralized.
                                    interoperable.
                                </p>
                            </div>
                        </div>

                        {!isConnected ? (
                            <LoginButton
                                text="Connect with Wallet"
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

                        <div className="content-data para-div">
                            <p className="text-primary-color details font-size-12">
                                Connect the dm3 messenger with your wallet and
                                sign in with a signature. No need for a username
                                or password.
                            </p>
                            <p className="keys-content text-primary-color details font-size-12">
                                Keys for secure and private communication are
                                derived from this signature.
                            </p>
                            <p className="tx-content text-primary-color details font-size-12">
                                No paid transaction will be executed.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
