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
import { configureChains, createConfig, mainnet, WagmiConfig } from 'wagmi';
import { gnosis, goerli } from 'wagmi/chains';
import { jsonRpcProvider } from 'wagmi/providers/jsonRpc';
import DM3 from '../../components/DM3/DM3';
import { Dm3Props } from '../../interfaces/config';
import './Home.css';
import { useContext, useMemo } from 'react';
import { Loader } from '../../components/Loader/Loader';
import { AuthContextProvider } from '../../context/AuthContext';
import { ConversationContextProvider } from '../../context/ConversationContext';
import { MessageContextProvider } from '../../context/MessageContext';
import { MainnetProviderContextProvider } from '../../context/ProviderContext';
import { StorageContextProvider } from '../../context/StorageContext';
import { TLDContextProvider } from '../../context/TLDContext';
import { WebSocketContextProvider } from '../../context/WebSocketContext';
import { GlobalContext } from '../../utils/context-utils';
import { DM3ConfigurationContextProvider } from '../../context/DM3ConfigurationContext';

export function Home(props: Dm3Props) {
    // fetches context api data
    const { dispatch } = useContext(GlobalContext);

    //Use different chains depending on the environment. Note that gnosis mainnet is used for both setups
    // because there is no spaceId testnet deploymend yet
    const _chains =
        props.dm3Configuration.chainId === '1'
            ? [mainnet, gnosis]
            : [goerli, gnosis];

    const { chains, publicClient } = configureChains(
        [..._chains],
        [
            jsonRpcProvider({
                rpc: () => ({
                    http: props.dm3Configuration.ethereumProvider as string,
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
                        projectId: props.dm3Configuration
                            .walletConnectProjectId as string,
                        chains,
                    }),
                    metaMaskWallet({
                        projectId: props.dm3Configuration
                            .walletConnectProjectId as string,
                        chains,
                    }),
                    walletConnectWallet({
                        projectId: props.dm3Configuration
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
                        <MainnetProviderContextProvider
                            dm3Configuration={props.dm3Configuration}
                        >
                            <TLDContextProvider>
                                <AuthContextProvider dispatch={dispatch}>
                                    <WebSocketContextProvider>
                                        <StorageContextProvider>
                                            {/* TODO move conversation and message contest further done as it dont need to be stored in the globlal state */}
                                            <ConversationContextProvider
                                                config={props.config}
                                            >
                                                <MessageContextProvider>
                                                    <DM3
                                                        config={props.config}
                                                        dm3Configuration={
                                                            props.dm3Configuration
                                                        }
                                                    />
                                                </MessageContextProvider>
                                            </ConversationContextProvider>
                                        </StorageContextProvider>
                                    </WebSocketContextProvider>
                                </AuthContextProvider>
                            </TLDContextProvider>
                        </MainnetProviderContextProvider>
                    </DM3ConfigurationContextProvider>
                </RainbowKitProvider>
            </WagmiConfig>
        </div>
    );
}
