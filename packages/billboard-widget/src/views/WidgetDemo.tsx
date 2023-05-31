import { ConnectButton } from '@rainbow-me/rainbowkit';
import '@rainbow-me/rainbowkit/styles.css';
import { ethers } from 'ethers';
import { useMemo } from 'react';
import { SiweMessage } from 'siwe';
import { useAccount, useSignMessage } from 'wagmi';
import App from '../App';
import EmptyView from '../components/EmptyView';
import { defaultOptions } from '../main';
import { ClientProps } from '../types';

const defaultClientProps: Omit<
    ClientProps,
    'siweAddress' | 'siweSig' | 'siweMessage'
> = {
    mockedApi: false,
    billboardId: 'billboard1.billboard.ethprague.dm3.eth',
    billboardClientUrl: 'https://billboard-ethprague-client.herokuapp.com/',
    deliveryServiceEnsName: 'ethprague-ds.dm3.eth',
    offchainResolverUrl: 'https://billboard-ethprague.herokuapp.com',
};
export const WidgetDemo = () => {
    const { address } = useAccount();
    const { data, signMessage } = useSignMessage();

    const message = useMemo(
        () =>
            new SiweMessage({
                domain: window.location.host,
                address: address,
                statement: 'Sign in with Ethereum to the app.',
                uri: window.location.origin,
                version: '1',
                chainId: 1,
                nonce: '0x123456789',
                expirationTime: new Date(100000000000000).toISOString(),
            }),
        [address],
    );
    const clientProps: ClientProps = useMemo(
        () => ({
            ...defaultClientProps,
            siweAddress: address?.toString() ?? '',
            siweMessage: JSON.stringify(message),
            siweSig: data ?? '',
        }),
        [address, data, message],
    );

    const singIn = () => {
        if (!address) {
            throw 'Address is not defined';
        }

        signMessage({ message: message.prepareMessage() });
    };

    return (
        <>
            <App
                clientProps={clientProps}
                options={defaultOptions}
                web3Provider={
                    new ethers.providers.Web3Provider(window.ethereum)
                }
            />

            <div className={`widget common-styles `}>
                {!data && (
                    <>
                        <EmptyView info={'Please sign in with Ethereum'} />
                        <div
                            style={{
                                display: 'flex',
                                justifyContent: 'center',
                                padding: '16px',
                            }}
                        >
                            {!address ? (
                                <ConnectButton />
                            ) : (
                                <button
                                    className="container"
                                    style={{
                                        borderRadius: '16px',
                                        padding: '1rem',
                                        color: 'black',
                                        backgroundColor: '#ffffff',
                                    }}
                                    onClick={singIn}
                                >
                                    Sign In with Ethereum
                                </button>
                            )}
                        </div>
                    </>
                )}
            </div>
        </>
    );
};
