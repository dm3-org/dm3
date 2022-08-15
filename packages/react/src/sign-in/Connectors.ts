import * as Lib from 'dm3-lib';
import { Actions } from '../GlobalContextProvider';
import { ConnectionType } from '../reducers/Connection';
import { GlobalState } from '../reducers/shared';
import { UiStateType } from '../reducers/UiState';
import localforage from 'localforage';
import { CacheType } from '../reducers/Cache';
import { ethers } from 'ethers';
import detectEthereumProvider from '@metamask/detect-provider';
import WalletConnectProvider from '@walletconnect/web3-provider';

function handleNewProvider(
    creationsResult: {
        provider?: ethers.providers.Web3Provider | undefined;
        connectionState: Lib.ConnectionState;
    },
    dispatch: React.Dispatch<Actions>,
) {
    if (creationsResult.provider) {
        dispatch({
            type: ConnectionType.ChangeProvider,
            payload: creationsResult.provider,
        });
    }

    dispatch({
        type: ConnectionType.ChangeConnectionState,
        payload: creationsResult.connectionState,
    });

    if (
        creationsResult.connectionState !==
        Lib.ConnectionState.AccountConntectReady
    ) {
        throw Error('Could not connect to MetaMask');
    }
}

export async function getMetaMaskProvider(dispatch: React.Dispatch<Actions>) {
    const web3Provider = await Lib.getWeb3Provider(
        await detectEthereumProvider(),
    );

    handleNewProvider(web3Provider, dispatch);
}

export async function getWalletConnectProvider(
    dispatch: React.Dispatch<Actions>,
) {
    const provider = new WalletConnectProvider({
        rpc: {
            //@ts-ignore
            1: process.env.REACT_APP_RPC,
        },
    });
    await provider.disconnect();
    await provider.enable();

    const web3Provider = await Lib.getWeb3Provider(provider);
    handleNewProvider(web3Provider, dispatch);
}

export async function connectAccount(
    state: GlobalState,
    dispatch: React.Dispatch<Actions>,
    preSetAccount?: string,
) {
    dispatch({
        type: ConnectionType.ChangeConnectionState,
        payload: Lib.ConnectionState.WaitingForAccountConntection,
    });

    const accountConnection = await Lib.connectAccount(
        state.connection,
        preSetAccount,
    );

    dispatch({
        type: UiStateType.SetProfileExists,
        payload: accountConnection.existingAccount,
    });
    Lib.log(
        accountConnection.existingAccount
            ? '[Connection] connected to existing profile'
            : '[Connection] connected to new profile',
    );
    if (accountConnection.account && !accountConnection.existingAccount) {
        await localforage.removeItem(
            Lib.getBrowserStorageKey(accountConnection.account),
        );
    }

    if (accountConnection.account) {
        dispatch({
            type: ConnectionType.ChangeConnectionState,
            payload: accountConnection.connectionState,
        });
        dispatch({
            type: ConnectionType.ChangeAccount,
            payload: {
                address: accountConnection.account,
                profile: accountConnection.profile?.profileRegistryEntry,
            },
        });

        const ensName = await Lib.lookupAddress(
            state.connection.provider as ethers.providers.JsonRpcProvider,
            accountConnection.account,
        );
        if (ensName) {
            dispatch({
                type: CacheType.AddEnsName,
                payload: {
                    address: accountConnection.account,
                    name: ensName,
                },
            });
        }
    } else {
        dispatch({
            type: ConnectionType.ChangeConnectionState,
            payload: accountConnection.connectionState,
        });
    }
}
