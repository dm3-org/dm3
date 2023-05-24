import { Actions } from '../GlobalContextProvider';
import { ConnectionType } from '../reducers/Connection';
import { GlobalState } from '../reducers/shared';
import { UiStateType } from '../reducers/UiState';
import localforage from 'localforage';

import { ethers } from 'ethers';
import detectEthereumProvider from '@metamask/detect-provider';

import { UserDbType } from '../reducers/UserDB';
import { AuthStateType } from '../reducers/Auth';
import { getDatabase } from './getDatabase';
import { connectEthAccount } from '../session/Connect';
import { ethersHelper, log } from 'dm3-lib-shared';
import { getBrowserStorageKey } from 'dm3-lib-profile';
import { StorageLocation } from 'dm3-lib-storage';
import { ConnectionState, getWeb3Provider } from '../web3provider/Web3Provider';

function handleNewProvider(
    creationsResult: {
        provider?: ethers.providers.Web3Provider | undefined;
        connectionState: ConnectionState;
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
        creationsResult.connectionState !== ConnectionState.AccountConntectReady
    ) {
        throw Error('Could not connect to MetaMask');
    }
}

export async function getMetaMaskProvider(dispatch: React.Dispatch<Actions>) {
    const web3Provider = await getWeb3Provider(await detectEthereumProvider());

    handleNewProvider(web3Provider, dispatch);
}

export async function connectAccount(
    state: GlobalState,
    dispatch: React.Dispatch<Actions>,
    preSetAccount?: string,
) {
    dispatch({
        type: ConnectionType.ChangeConnectionState,
        payload: ConnectionState.WaitingForAccountConntection,
    });

    const accountConnection = await connectEthAccount(
        state.connection,
        ethersHelper.requestAccounts,
        preSetAccount,
    );

    dispatch({
        type: UiStateType.SetProfileExists,
        payload: accountConnection.existingAccount,
    });
    log(
        accountConnection.existingAccount
            ? '[Connection] connected to existing profile'
            : '[Connection] connected to new profile',
        'info',
    );
    if (accountConnection.account && !accountConnection.existingAccount) {
        await localforage.removeItem(
            getBrowserStorageKey(accountConnection.account),
        );
    }

    if (accountConnection.ethAddress) {
        dispatch({
            type: ConnectionType.ChangeEthAddress,
            payload: accountConnection.ethAddress,
        });
    }

    if (accountConnection.account) {
        dispatch({
            type: ConnectionType.ChangeConnectionState,
            payload: accountConnection.connectionState,
        });
        dispatch({
            type: ConnectionType.ChangeAccount,
            payload: {
                ensName: accountConnection.account,
                profile: accountConnection.profile?.profile,
                profileSignature: accountConnection.profile?.signature,
            },
        });
    } else {
        dispatch({
            type: ConnectionType.ChangeConnectionState,
            payload: accountConnection.connectionState,
        });
    }
}

export async function signIn(
    storageLocation: StorageLocation,
    storageToken: string | undefined,
    state: GlobalState,
    dispatch: React.Dispatch<Actions>,
) {
    dispatch({
        type: ConnectionType.ChangeConnectionState,
        payload: ConnectionState.WaitingForSignIn,
    });

    // Get the users DB. Based wether the profile already exits the db
    // will either be created by decrypting the exisitng storge file
    // or by by creating a enitre new profile
    const { db, connectionState, deliveryServiceToken, account } =
        await getDatabase(
            state.uiState.proflieExists,
            storageLocation,
            storageToken,
            state,
            dispatch,
        );

    if (!account?.ensName && !state.connection.account) {
        throw Error(`Couldn't find account`);
    }

    if (account) {
        dispatch({
            type: ConnectionType.ChangeAccount,
            payload: account,
        });
    }

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
            ensName: account
                ? account.ensName
                : state.connection.account!.ensName,
            storage: storageLocation,
        },
    });

    dispatch({
        type: ConnectionType.ChangeConnectionState,
        payload: connectionState,
    });
}
