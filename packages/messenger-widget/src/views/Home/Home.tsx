/* eslint-disable no-console */
import '@rainbow-me/rainbowkit/styles.css';
import DM3 from '../../components/DM3/DM3';
import { Dm3Props } from '../../interfaces/config';
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

import { useContext, useMemo } from 'react';
import { defineChain } from 'viem';
import { configureChains, createConfig, WagmiConfig } from 'wagmi';
import { goerli } from 'wagmi/chains';
import { jsonRpcProvider } from 'wagmi/providers/jsonRpc';
import AddConversation from '../../components/AddConversation/AddConversation';
import { Loader } from '../../components/Loader/Loader';
import { Preferences } from '../../components/Preferences/Preferences';
import { AuthContextProvider } from '../../context/AuthContext';
import { GlobalContext } from '../../utils/context-utils';
import './Home.css';

//@ts-ignore
const chiado = defineChain({
    id: 10200,
    name: 'Chidado ',
    network: 'chidado ',
    nativeCurrency: {
        decimals: 18,
        name: 'Gnosis',
        symbol: 'xDAI',
    },
    rpcUrls: {
        default: { http: ['https://rpc.chiadochain.net'] },
        public: { http: ['https://rpc.chiadochain.net	'] },
    },
    contracts: {
        multicall3: {
            address: '0xca11bde05977b3631167028862be2a173976ca11',
            blockCreated: 21022491,
        },
    },
});

export function Home(props: Dm3Props) {
    // fetches context api data
    const { state, dispatch } = useContext(GlobalContext);

    const { chains, publicClient } = configureChains(
        [goerli, chiado],
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
