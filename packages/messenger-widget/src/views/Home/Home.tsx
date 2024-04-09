/* eslint-disable max-len */
/* eslint-disable no-console */
import './Home.css';
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
import { useMemo } from 'react';
import {
    configureChains,
    createConfig,
    mainnet,
    sepolia,
    WagmiConfig,
} from 'wagmi';
import { gnosis, optimism, optimismSepolia } from 'wagmi/chains';
import { jsonRpcProvider } from 'wagmi/providers/jsonRpc';
import DM3 from '../../components/DM3/DM3';
import { Loader } from '../../components/Loader/Loader';
import { AuthContextProvider } from '../../context/AuthContext';
import { ConversationContextProvider } from '../../context/ConversationContext';
import { DM3ConfigurationContextProvider } from '../../context/DM3ConfigurationContext';
import { MessageContextProvider } from '../../context/MessageContext';
import { MainnetProviderContextProvider } from '../../context/ProviderContext';
import { StorageContextProvider } from '../../context/StorageContext';
import { TLDContextProvider } from '../../context/TLDContext';
import { WebSocketContextProvider } from '../../context/WebSocketContext';
import { Dm3Props } from '../../interfaces/config';
import { UiViewContextProvider } from '../../context/UiViewContext';

export function Home(props: Dm3Props) {
    //Use different chains depending on the environment. Note that gnosis mainnet is used for both setups
    // because there is no spaceId testnet deploymend yet
    const _chains =
        props.config.chainId === '1'
            ? [mainnet, optimism, gnosis]
            : [sepolia, optimismSepolia, gnosis];

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
        <div className="h-100 position-relative">
            <Loader />
            <WagmiConfig config={wagmiConfig}>
                <RainbowKitProvider chains={chains} theme={darkTheme()}>
                    <DM3ConfigurationContextProvider>
                        <UiViewContextProvider>
                            <MainnetProviderContextProvider
                                dm3Configuration={props.config}
                            >
                                <TLDContextProvider>
                                    <AuthContextProvider>
                                        <WebSocketContextProvider>
                                            <StorageContextProvider>
                                                {/* TODO move conversation and message contest further done as it dont need to be stored in the globlal state */}
                                                <ConversationContextProvider
                                                    config={props.config}
                                                >
                                                    <MessageContextProvider>
                                                        <DM3
                                                            config={
                                                                props.config
                                                            }
                                                        />
                                                    </MessageContextProvider>
                                                </ConversationContextProvider>
                                            </StorageContextProvider>
                                        </WebSocketContextProvider>
                                    </AuthContextProvider>
                                </TLDContextProvider>
                            </MainnetProviderContextProvider>
                        </UiViewContextProvider>
                    </DM3ConfigurationContextProvider>
                </RainbowKitProvider>
            </WagmiConfig>
        </div>
    );
}
