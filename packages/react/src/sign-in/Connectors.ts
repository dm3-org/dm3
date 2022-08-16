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
import { UserDbType } from '../reducers/UserDB';

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

export async function signIn(
    storageLocation: Lib.StorageLocation,
    token: string | undefined,
    storeApiToken: boolean,
    dataFile: string | undefined,
    state: GlobalState,
    dispatch: React.Dispatch<Actions>,
) {
    dispatch({
        type: ConnectionType.ChangeConnectionState,
        payload: Lib.ConnectionState.WaitingForSignIn,
    });

    let data = dataFile;

    const account: Lib.Account = {
        address: state.connection.account!.address,
    };

    let browserDataFile: Lib.UserStorage | undefined | null =
        state.uiState.proflieExists && state.uiState.browserStorageBackup
            ? await localforage.getItem(
                  Lib.getBrowserStorageKey(account.address),
              )
            : null;

    let preLoadedKey: string | undefined;
    let overwriteUserDb: Partial<Lib.UserDB> = {};

    if (state.uiState.proflieExists) {
        switch (storageLocation) {
            case Lib.StorageLocation.Web3Storage:
                data = state.uiState.proflieExists
                    ? await Lib.web3Load(token as string)
                    : undefined;
                break;

            case Lib.StorageLocation.GoogleDrive:
                data = state.uiState.proflieExists
                    ? await Lib.googleLoad((window as any).gapi)
                    : undefined;
                break;

            case Lib.StorageLocation.dm3Storage:
                let authToken = (await localforage.getItem(
                    'ENS_MAIL_AUTH_' + account.address,
                )) as string;
                if (!authToken) {
                    authToken = await Lib.reAuth(state.connection);
                    await localforage.setItem(
                        'ENS_MAIL_AUTH_' + account.address,
                        authToken,
                    );

                    browserDataFile = undefined;
                }

                try {
                    data = state.uiState.proflieExists
                        ? await Lib.getDm3Storage(state.connection, authToken)
                        : undefined;
                } catch (e) {
                    if (
                        (e as Error).message.includes(
                            'Request failed with status code 401',
                        )
                    ) {
                        authToken = await Lib.reAuth(state.connection);
                        await localforage.setItem(
                            'ENS_MAIL_AUTH_' + account.address,
                            authToken,
                        );
                        data = state.uiState.proflieExists
                            ? await Lib.getDm3Storage(
                                  state.connection,
                                  authToken,
                              )
                            : undefined;
                        overwriteUserDb = {
                            deliveryServiceToken: authToken,
                        };

                        browserDataFile = undefined;
                    } else {
                        throw e;
                    }
                }
                overwriteUserDb = {
                    deliveryServiceToken: authToken,
                };

                break;
        }
    }

    if (state.uiState.proflieExists && !browserDataFile && !data) {
        dispatch({
            type: ConnectionType.ChangeConnectionState,
            payload: Lib.ConnectionState.SignInFailed,
        });
    } else {
        const singInRequest = await Lib.signIn(
            state.connection,
            browserDataFile ? browserDataFile : undefined,
            data,
            overwriteUserDb,
            preLoadedKey,
        );

        if (singInRequest.db) {
            Lib.log(`Setting session token`);

            account.profile = (
                await Lib.getProfileRegistryEntry(
                    state.connection,
                    account.address,
                    state.connection.defaultServiceUrl +
                        '/profile/' +
                        account.address,
                )
            )?.profileRegistryEntry;

            if (
                token &&
                storeApiToken &&
                storageLocation === Lib.StorageLocation.Web3Storage
            ) {
                window.localStorage.setItem('StorageToken', token);
            }

            window.localStorage.setItem('StorageLocation', storageLocation);

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
                payload: token,
            });
            dispatch({ type: UserDbType.setDB, payload: singInRequest.db });

            dispatch({
                type: ConnectionType.ChangeConnectionState,
                payload: singInRequest.connectionState,
            });
        }
        dispatch({
            type: ConnectionType.ChangeConnectionState,
            payload: singInRequest.connectionState,
        });
    }
}
