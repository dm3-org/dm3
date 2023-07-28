import './Home.css';
import DM3 from '../../components/DM3/DM3';
import { Dm3Props } from '../../interfaces/config';
import dm3Logo from '../../assets/images/dm3-logo.png';
import '@rainbow-me/rainbowkit/styles.css';
import {
    connectorsForWallets,
    darkTheme,
    RainbowKitProvider,
} from '@rainbow-me/rainbowkit';
import { configureChains, createConfig, WagmiConfig } from 'wagmi';
import { mainnet } from 'wagmi/chains';
import { rainbowWallet } from '@rainbow-me/rainbowkit/wallets';
import { jsonRpcProvider } from 'wagmi/providers/jsonRpc';
import { useEffect, useState } from 'react';
import { openErrorModal } from '../../utils/common-utils';

export function Home(props: Dm3Props) {
    const [isRainbowConfigValid, setIsRainbowConfigValid] =
        useState<boolean>(false);
    const [chains, setChains] = useState<any>();
    const [wagmiConfig, setWagmiConfig] = useState<any>();

    // confgures rainbow kit
    const configureRainbowKit = () => {
        try {
            const { chains, publicClient } = configureChains(
                [mainnet],
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
                            projectId: props.config
                                .walletConnectProjectId as string,
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

            setWagmiConfig(wagmiConfig);
            setChains(chains);
        } catch (error: unknown) {
            throw Error('Error occured in rainbow kit initialization');
        }
    };

    // checks whether ethereum provider and wallet connect project is provided or not
    const checkConfigValidity = (): boolean => {
        const projectId = props.config.walletConnectProjectId;
        const provider = props.config.ethereumProvider;

        if (!provider || provider.length < 5) {
            openErrorModal('Please provide a valid Ethereum provider', false);
            return false;
        } else if (!projectId || projectId.length < 5) {
            openErrorModal('Please provide a valid Ethereum provider', false);
            return false;
        } else {
            return true;
        }
    };

    // initializes rainbow kit if valid credentials are provided
    useEffect(() => {
        if (!isRainbowConfigValid) {
            const check: boolean = checkConfigValidity();
            setIsRainbowConfigValid(check);
            if (check) {
                configureRainbowKit();
            }
        }
    }, [isRainbowConfigValid]);

    return (
        <div>
            <div className="logo-container">
                <img className="dm3-logo" src={dm3Logo} alt="DM3 logo" />
            </div>
            {isRainbowConfigValid && wagmiConfig && chains && (
                <WagmiConfig config={wagmiConfig}>
                    <RainbowKitProvider chains={chains} theme={darkTheme()}>
                        <DM3 config={props.config} />
                    </RainbowKitProvider>
                </WagmiConfig>
            )}
        </div>
    );
}
