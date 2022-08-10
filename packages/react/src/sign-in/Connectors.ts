import * as Lib from 'dm3-lib';
import { Actions } from '../GlobalContextProvider';
import { ConnectionType } from '../reducers/Connection';
import { GlobalState } from '../reducers/shared';
import { UiStateType } from '../reducers/UiState';
import localforage from 'localforage';
import { CacheType } from '../reducers/Cache';
import { ethers } from 'ethers';
import detectEthereumProvider from '@metamask/detect-provider';

export async function getMetaMaskProvider(dispatch: React.Dispatch<Actions>) {
    {
        const web3Provider = await Lib.getWeb3Provider(
            await detectEthereumProvider(),
        );

        if (web3Provider.provider) {
            dispatch({
                type: ConnectionType.ChangeProvider,
                payload: web3Provider.provider,
            });
        }

        dispatch({
            type: ConnectionType.ChangeConnectionState,
            payload: web3Provider.connectionState,
        });

        if (
            web3Provider.connectionState !==
            Lib.ConnectionState.AccountConntectReady
        ) {
            throw Error('Could not connect to MetaMask');
        }
    }
}

export async function connectAccount(
    state: GlobalState,
    dispatch: React.Dispatch<Actions>,
) {
    dispatch({
        type: ConnectionType.ChangeConnectionState,
        payload: Lib.ConnectionState.WaitingForAccountConntection,
    });

    const accountConnection = await Lib.connectAccount(state.connection);

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
