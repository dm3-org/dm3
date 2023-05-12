import { useState, useEffect } from 'react';
import detectEthereumProvider from '@metamask/detect-provider';
import { MetaMaskInpageProvider } from '@metamask/providers';
import { getUserProfile } from 'dm3-lib-profile';

export function useMetaMask() {
    const [hasProvider, setHasProvider] = useState<boolean | null>(null);
    const [provider, setProvider] = useState<MetaMaskInpageProvider | null>(
        null,
    );
    const initialState = { accounts: [] };
    const [wallet, setWallet] = useState(initialState);

    useEffect(() => {
        const getProvider = async () => {
            const provider = await detectEthereumProvider({ silent: true });
            setProvider(provider as MetaMaskInpageProvider);
            setHasProvider(Boolean(provider)); // transform provider to true or false
        };

        getProvider();
    }, []);

    const updateWallet = async (accounts: any) => {
        setWallet({ accounts });
    };

    const handleConnect = async () => {
        const accounts = await window.ethereum.request({
            method: 'eth_requestAccounts',
        });
        updateWallet(accounts);

        if (provider) {
            // TODO: handle missing dm3 profile on account
            // TODO: extract profile logic to profileHook
            getUserProfile(provider as any, wallet.accounts[0]);
        }
    };

    return {
        handleConnect,
        wallet,
        hasProvider,
    };
}
