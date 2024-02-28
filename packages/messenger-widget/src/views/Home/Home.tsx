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
import { useContext, useMemo } from 'react';
import { gnosis, goerli, mainnet } from 'wagmi/chains';
import { Loader } from '../../components/Loader/Loader';
import { AuthContextProvider } from '../../context/AuthContext';
import { ConversationContextProvider } from '../../context/ConversationContext';
import { MessageContextProvider } from '../../context/MessageContext';
import { MainnetProviderContextProvider } from '../../context/ProviderContext';
import { StorageContextProvider } from '../../context/StorageContext';
import { WebSocketContextProvider } from '../../context/WebSocketContext';
import { GlobalContext } from '../../utils/context-utils';
import './Home.css';
import { TLDContextProvider } from '../../context/TLDContext';
import { QueryClientProvider, QueryClient } from '@tanstack/react-query';
// @ts-ignore
import { WagmiProvider, http, createConfig } from 'wagmi';

export function Home(props: Dm3Props) {
    // fetches context api data
    const { dispatch } = useContext(GlobalContext);

    //Use different chains depending on the environment.
    const ethChain = props.dm3Configuration.chainId === '1' ? mainnet : goerli;

    // Configures supported wallets
    const connectors = useMemo(() => {
        return connectorsForWallets(
            [
                {
                    groupName: 'Popular',
                    wallets: [
                        metaMaskWallet,
                        rainbowWallet,
                        walletConnectWallet,
                    ],
                },
            ],
            {
                appName: 'DM3 app',
                projectId: props.config.walletConnectProjectId as string,
            },
        );
    }, []);

    // Note that gnosis mainnet is used for both setups because there is no spaceId testnet deploymend yet
    const wagmiConfigProvider = createConfig({
        connectors,
        chains: [gnosis, ethChain],
        transports: {
            [ethChain.id]: http(),
            [gnosis.id]: http(),
        },
    });

    const queryClient = new QueryClient();

    return (
        <div className="h-100 position-relative">
            <Loader />
            <WagmiProvider config={wagmiConfigProvider}>
                <QueryClientProvider client={queryClient}>
                    <RainbowKitProvider theme={darkTheme()}>
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
                    </RainbowKitProvider>
                </QueryClientProvider>
            </WagmiProvider>
        </div>
    );
}
