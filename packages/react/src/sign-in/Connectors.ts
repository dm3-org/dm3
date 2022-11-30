import * as Lib from 'dm3-lib';
import { Actions, GlobalContext } from '../GlobalContextProvider';
import { ConnectionType } from '../reducers/Connection';
import { GlobalState } from '../reducers/shared';
import { UiStateType } from '../reducers/UiState';
import localforage from 'localforage';
import { CacheType } from '../reducers/Cache';
import { ethers } from 'ethers';
import detectEthereumProvider from '@metamask/detect-provider';
import WalletConnectProvider from '@walletconnect/web3-provider';
import { UserDbType } from '../reducers/UserDB';
import { getStorageFile } from './getStorageFile';
import { AuthStateType } from '../reducers/Auth';
import { sign } from 'dm3-lib/dist/crypto';
import { getDatabase } from './getDatabase';

function handleNewProvider(
    creationsResult: {
        provider?: ethers.providers.Web3Provider | undefined;
        connectionState: Lib.web3provider.ConnectionState;
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
        Lib.web3provider.ConnectionState.AccountConntectReady
    ) {
        throw Error('Could not connect to MetaMask');
    }
}

export async function getMetaMaskProvider(dispatch: React.Dispatch<Actions>) {
    const web3Provider = await Lib.web3provider.getWeb3Provider(
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

    const web3Provider = await Lib.web3provider.getWeb3Provider(provider);
    handleNewProvider(web3Provider, dispatch);
}

export async function connectAccount(
    state: GlobalState,
    dispatch: React.Dispatch<Actions>,
    preSetAccount?: string,
) {
    dispatch({
        type: ConnectionType.ChangeConnectionState,
        payload: Lib.web3provider.ConnectionState.WaitingForAccountConntection,
    });

    const accountConnection = await Lib.session.connectAccount(
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
            Lib.account.getBrowserStorageKey(accountConnection.account),
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
                profile: accountConnection.profile?.profile,
            },
        });

        const ensName = await Lib.external.lookupAddress(
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

export async function signIn(
    storageLocation: Lib.storage.StorageLocation,
    storageToken: string | undefined,
    state: GlobalState,
    dispatch: React.Dispatch<Actions>,
) {
    dispatch({
        type: ConnectionType.ChangeConnectionState,
        payload: Lib.web3provider.ConnectionState.WaitingForSignIn,
    });

    // eslint-disable-next-line max-len
    //Get the users DB. Based wether the profile already exits the db will either be created by decrypting the exisitng storge file or by by creating a enitre new profile
    const { db, connectionState, deliveryServiceToken } = await getDatabase(
        state.uiState.proflieExists,
        storageLocation,
        storageToken,
        state,
        dispatch,
    );

    const address = state.connection.account!.address;
    //Fetching the profile from the Delivery Service
    const profile = (
        await Lib.account.getUserProfile(
            state.connection,
            address,
            state.connection.defaultServiceUrl + '/profile/' + address,
        )
    )?.profile;

    const account: Lib.account.Account = {
        address: state.connection.account!.address,
        profile,
    };

    dispatch({
        type: ConnectionType.ChangeAccount,
        payload: account,
    });
    dispatch({
        type: ConnectionType.ChangeStorageLocation,
        payload: storageLocation,
    });
    dispatch({
        type: ConnectionType.ChangeStorageToken,
        payload: storageToken,
    });
    dispatch({ type: UserDbType.setDB, payload: db! });

    dispatch({
        type: ConnectionType.ChangeConnectionState,
        payload: connectionState,
    });
    dispatch({
        type: AuthStateType.AddNewSession,
        payload: {
            token: deliveryServiceToken,
            address: account.address,
            storage: storageLocation,
        },
    });

    dispatch({
        type: ConnectionType.ChangeConnectionState,
        payload: connectionState,
    });
}
