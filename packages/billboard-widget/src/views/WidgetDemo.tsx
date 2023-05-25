import { useEffect, useMemo, useState } from 'react';
import App from '..';
import EmptyView from '../components/EmptyView';
import { defaultOptions } from '../main';
import { ClientProps } from '../types';
import '@rainbow-me/rainbowkit/styles.css';
import { WagmiWrapper } from './WagmiWrapper';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount, useSignMessage } from 'wagmi';

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
    const { data, error, isLoading, signMessage, variables } = useSignMessage();

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
        signMessage({ message: address!.toString() });
    };


    return (
        <>
            {clientProps.siweSig !== '' ? (
                <App
                    clientProps={clientProps}
                    options={defaultOptions}
                    web3Provider={window.ethereum}
                />
            ) : (
                <div className={`widget common-styles `}>
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
                </div>
            )}
        </>
    );
};
