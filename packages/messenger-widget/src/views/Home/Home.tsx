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
import { goerli } from 'wagmi/chains';
import {
    metaMaskWallet,
    rainbowWallet,
    walletConnectWallet,
} from '@rainbow-me/rainbowkit/wallets';
import { jsonRpcProvider } from 'wagmi/providers/jsonRpc';
import { Loader } from '../../components/Loader/Loader';
import AddConversation from '../../components/AddConversation/AddConversation';
import { Preferences } from '../../components/Preferences/Preferences';
import { ConfigureProfile } from '../../components/ConfigureProfile/ConfigureProfile';

export function Home(props: Dm3Props) {
    const { chains, publicClient } = configureChains(
        [goerli],
        [
            jsonRpcProvider({
                rpc: () => ({
                    http: props.config.ethereumProvider as string,
                }),
            }),
        ],
    );

    const connectors = connectorsForWallets([
        {
            groupName: 'Popular',
            wallets: [
                rainbowWallet({
                    projectId: props.config.walletConnectProjectId as string,
                    chains,
                }),
                metaMaskWallet({
                    projectId: props.config.walletConnectProjectId as string,
                    chains,
                }),
                walletConnectWallet({
                    projectId: props.config.walletConnectProjectId as string,
                    chains,
                }),
            ],
        },
    ]);

    const wagmiConfig = createConfig({
        autoConnect: true,
        connectors,
        publicClient,
    });

    return (
        <div className="h-100">
            <Loader />
            <AddConversation />
            <Preferences />
            <WagmiConfig config={wagmiConfig}>
                <RainbowKitProvider chains={chains} theme={darkTheme()}>
                    <DM3 config={props.config} />
                </RainbowKitProvider>
            </WagmiConfig>
        </div>
    );
}
