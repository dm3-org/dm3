/* eslint-disable max-len */
/* eslint-disable no-console */
import {
    connectorsForWallets,
    darkTheme,
    RainbowKitProvider,
} from '@rainbow-me/rainbowkit';
import '@rainbow-me/rainbowkit/styles.css';
import {
    metaMaskWallet,
    rainbowWallet,
    walletConnectWallet,
} from '@rainbow-me/rainbowkit/wallets';
import DM3 from '../../components/DM3/DM3';
import { Dm3Props } from '../../interfaces/config';
import './Home.css';

import { useContext, useEffect, useMemo } from 'react';
import { configureChains, createConfig, mainnet, WagmiConfig } from 'wagmi';
import { gnosis, goerli } from 'wagmi/chains';
import { jsonRpcProvider } from 'wagmi/providers/jsonRpc';
import AddConversation from '../../components/AddConversation/AddConversation';
import { Loader } from '../../components/Loader/Loader';
import { AuthContextProvider } from '../../context/AuthContext';
import { MainnetProviderContextProvider } from '../../context/ProviderContext';
import { GlobalContext } from '../../utils/context-utils';
import './Home.css';
import { StorageContextProvider } from '../../context/StorageContext';
import {
    ConversationContext,
    ConversationContextProvider,
} from '../../context/ConversationContext';

//Use different chains depending on the environment. Note that gnosis mainnet is used for both setups
// because there is no spaceId testnet deploymend yet
const _chains =
    process.env.REACT_APP_CHAIN_ID === '1'
        ? [mainnet, gnosis]
        : [goerli, gnosis];

export function Home(props: Dm3Props) {
    // fetches context api data
    const { state, dispatch } = useContext(GlobalContext);

    const { chains, publicClient } = configureChains(
        [..._chains],
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

    return (
        <div className="h-100">
            <Loader />
            <WagmiConfig config={wagmiConfig}>
                <RainbowKitProvider chains={chains} theme={darkTheme()}>
                    <MainnetProviderContextProvider>
                        <AuthContextProvider dispatch={dispatch}>
                            <StorageContextProvider>
                                {/* TODO move conversation and message contest further done as it dont need to be stored in the globlal state */}
                                <ConversationContextProvider>
                                    <DM3 config={props.config} />
                                </ConversationContextProvider>
                            </StorageContextProvider>
                        </AuthContextProvider>
                    </MainnetProviderContextProvider>
                </RainbowKitProvider>
            </WagmiConfig>
        </div>
    );
}
