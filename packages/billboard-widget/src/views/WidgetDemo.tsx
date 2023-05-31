import { ConnectButton } from '@rainbow-me/rainbowkit';
import '@rainbow-me/rainbowkit/styles.css';
import { useMemo } from 'react';
import { useAccount, useSignMessage } from 'wagmi';
import App from '../App';
import EmptyView from '../components/EmptyView';
import { defaultOptions } from '../main';
import { ClientProps } from '../types';
import { ethers } from 'ethers';

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

    const clientProps: ClientProps = useMemo(
        () => ({
            ...defaultClientProps,
            siweAddress: address?.toString() ?? '',
            siweMessage: address?.toString() ?? '',
            siweSig: data ?? '',
        }),
        [address, data],
    );

    const singIn = () => {
        if (!address) {
            throw 'Address is not defined';
        }
        signMessage({ message: address.toString() });
    };

    return (
        <>
            <App
                clientProps={clientProps}
                options={defaultOptions}
                web3Provider={
                    new ethers.providers.Web3Provider(window.ethereum)
                }
                branding={{ slogan: 'LIVE CHAT' }}
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
