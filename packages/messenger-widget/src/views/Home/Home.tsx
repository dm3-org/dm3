/* eslint-disable no-console */
import './Home.css';
import DM3 from '../../components/DM3/DM3';
import { Dm3Props } from '../../interfaces/config';
import '@rainbow-me/rainbowkit/styles.css';
import {
    connectorsForWallets,
    darkTheme,
    RainbowKitProvider,
} from '@rainbow-me/rainbowkit';
import { configureChains, createConfig, WagmiConfig } from 'wagmi';
import { gnosis, goerli } from 'wagmi/chains';
import {
    metaMaskWallet,
    rainbowWallet,
    walletConnectWallet,
} from '@rainbow-me/rainbowkit/wallets';
import { jsonRpcProvider } from 'wagmi/providers/jsonRpc';
import { Loader } from '../../components/Loader/Loader';
import AddConversation from '../../components/AddConversation/AddConversation';
import { Preferences } from '../../components/Preferences/Preferences';

import { AuthContextProvider } from '../../context/AuthContext';
import { useContext, useMemo } from 'react';
import { GlobalContext } from '../../utils/context-utils';

export function Home(props: Dm3Props) {
    // fetches context api data
    const { state, dispatch } = useContext(GlobalContext);

    const { chains, publicClient } = configureChains(
        [goerli, gnosis],
        [
            jsonRpcProvider({
                rpc: () => ({
                    http: props.config.ethereumProvider as string,
                }),
            }),
        ],
    );

    const connectors = useMemo(() => {
        return connectorsForWallets([
            {
                groupName: 'Popular',
                wallets: [
                    rainbowWallet({
                        projectId: props.config
                            .walletConnectProjectId as string,
                        chains,
                    }),
                    metaMaskWallet({
                        projectId: props.config
                            .walletConnectProjectId as string,
                        chains,
                    }),
                    walletConnectWallet({
                        projectId: props.config
                            .walletConnectProjectId as string,
                        chains,
                    }),
                ],
            },
        ]);
    }, []);

    const wagmiConfig = useMemo(() => {
        return createConfig({
            autoConnect: true,
            connectors,
            publicClient,
        });
    }, []);

    console.log('home');
    return (
        <div className="h-100">
            <Loader />
            <AddConversation />
            <Preferences />
            <WagmiConfig config={wagmiConfig}>
                <RainbowKitProvider chains={chains} theme={darkTheme()}>
                    <AuthContextProvider dispatch={dispatch}>
                        <DM3 config={props.config} />
                    </AuthContextProvider>
                </RainbowKitProvider>
            </WagmiConfig>
        </div>
    );
}
