import {
    Account,
    getBrowserStorageKey,
    ProfileKeys,
    createProfileKeys,
    SignedUserProfile,
    UserProfile,
    getProfileCreationMessage,
    getUserProfile,
    checkUserProfile,
} from 'dm3-lib-profile';
import {
    createStorageKey,
    getStorageKeyCreationMessage,
    sign,
} from 'dm3-lib-crypto';
import { ethersHelper, globalConfig, log, stringify } from 'dm3-lib-shared';
import {
    UserDB,
    StorageLocation,
    getDm3Storage,
    googleLoad,
    web3Load,
    load,
    createDB,
} from 'dm3-lib-storage';
import localforage from 'localforage';
import { Connection, SignInProps } from '../../interfaces/web3';
import {
    ConnectionType,
    ConnectionState,
    GoogleAuthState,
    GlobalState,
    Actions,
    AuthStateType,
    UserDbType,
    UiStateType,
    ButtonState,
    SignInBtnValues,
} from '../../utils/enum-type-utils';
import {
    getChallenge,
    getNewToken,
    GetChallenge,
    GetNewToken,
    SubmitUserProfile,
    submitUserProfile,
} from 'dm3-lib-delivery-api';
import { ethers } from 'ethers';
import { claimAddress, getNameForAddress } from 'dm3-lib-offchain-resolver-api';
import axios from 'axios';
import { openErrorModal } from '../../utils/common-utils';
import loader from '../../assets/images/loader.svg';

const DEFAULT_NONCE = '0';

export const getStorageLocation = (props: SignInProps) => {
    const persistedStorageLocation = window.localStorage.getItem(
        'StorageLocation',
    ) as StorageLocation | null;

    return (
        props.defaultStorageLocation ??
        persistedStorageLocation ??
        StorageLocation.File
    );
};

export const initToken = (state: any, storageLocation: any, setToken: any) => {
    if (
        state.uiState.proflieExists &&
        storageLocation === StorageLocation.Web3Storage
    ) {
        setToken(window.localStorage.getItem('StorageToken') as string);
    }
};

export const checkState = async (
    state: any,
    dispatch: any,
    storageLocation: any,
    token: any,
    dataFile: any,
    googleAuthState: any,
) => {
    const setAccountConnectReady = () =>
        dispatch({
            type: ConnectionType.ChangeConnectionState,
            payload: ConnectionState.AccountConnectReady,
        });

    const setCollectingInfos = () =>
        dispatch({
            type: ConnectionType.ChangeConnectionState,
            payload: ConnectionState.CollectingSignInData,
        });

    const browserDataFile =
        state.connection.account && state.uiState.browserStorageBackup
            ? await localforage.getItem(
                  getBrowserStorageKey(state.connection.account.ensName),
              )
            : null;

    const isCollectingSignInData =
        state.connection.connectionState ===
        ConnectionState.CollectingSignInData;
    const isSignInReady =
        state.connection.connectionState === ConnectionState.SignInReady;

    if (
        storageLocation === StorageLocation.File &&
        !state.uiState.proflieExists &&
        isCollectingSignInData
    ) {
        setAccountConnectReady();
    } else if (
        token &&
        storageLocation === StorageLocation.Web3Storage &&
        isCollectingSignInData
    ) {
        setAccountConnectReady();
    } else if (
        storageLocation === StorageLocation.File &&
        state.uiState.proflieExists &&
        isCollectingSignInData &&
        (dataFile || browserDataFile)
    ) {
        setAccountConnectReady();
    } else if (
        storageLocation === StorageLocation.dm3Storage &&
        isCollectingSignInData
    ) {
        setAccountConnectReady();
    }

    if (
        storageLocation === StorageLocation.File &&
        state.uiState.proflieExists &&
        isSignInReady
    ) {
        setAccountConnectReady();
    } else if (
        !token &&
        storageLocation === StorageLocation.Web3Storage &&
        isSignInReady
    ) {
        setCollectingInfos();
    } else if (
        storageLocation === StorageLocation.GoogleDrive &&
        isSignInReady &&
        googleAuthState !== GoogleAuthState.Success
    ) {
        setCollectingInfos();
    }
};

export async function createKeyPairsFromSignature(
    connection: Partial<Connection>,
    personalSign: ethersHelper.PersonalSign,
    nonce: string,
    setSignInBtnContent: React.Dispatch<React.SetStateAction<SignInBtnValues>>,
): Promise<ProfileKeys> {
    const { provider, ethAddress } = connection;

    if (!provider) {
        throw Error('createKeyPairsFromSig: no provider');
    }

    if (!ethAddress) {
        throw Error('No eth address');
    }

    const storageKeyCreationMessage = getStorageKeyCreationMessage(nonce);

    const signature = await personalSign(
        provider,
        ethAddress,
        storageKeyCreationMessage,
    );

    setSignInBtnContent(SignInBtnValues.SigningIn);
    const storageKey = await createStorageKey(signature);

    return await createProfileKeys(storageKey, nonce);
}

export async function createKeyPairsFromSig(
    connection: Partial<Connection>,
    nonce: string,
    setSignInBtnContent: React.Dispatch<React.SetStateAction<SignInBtnValues>>,
): Promise<ProfileKeys> {
    return createKeyPairsFromSignature(
        connection,
        ethersHelper.prersonalSign,
        nonce,
        setSignInBtnContent,
    );
}

export async function execReAuth(
    connection: Connection,
    getChallenge: GetChallenge,
    getNewToken: GetNewToken,
    privateSigningKey: string,
): Promise<string> {
    if (!connection.account) {
        throw Error('No account set');
    }

    if (!connection.provider) {
        throw Error('No provider');
    }

    const challenge = await getChallenge(
        connection.account,
        connection.provider,
    );

    const signature = await sign(privateSigningKey, challenge);
    return getNewToken(connection.account, connection.provider, signature);
}

export async function reAuth(
    connection: Connection,
    privateSigningKey: string,
) {
    return execReAuth(connection, getChallenge, getNewToken, privateSigningKey);
}

export async function getStorageFile(
    storageLocation: StorageLocation,
    web3StorageToken: string,
    deliveryServiceToken: string,
    connection: Connection,
) {
    switch (storageLocation) {
        case StorageLocation.Web3Storage:
            return await web3Load(web3StorageToken as string);

        case StorageLocation.GoogleDrive:
            return await googleLoad((window as any).gapi);

        //Should result in reSignin
        case StorageLocation.dm3Storage:
            return await getDm3Storage(
                connection.provider!,
                connection.account!,
                deliveryServiceToken,
            );

        default:
            throw Error('Unsupported Storage Location');
    }
}

export async function getSessionFromStorage(
    storageFile: string,
    keys: ProfileKeys,
) {
    const externalData = await load(
        JSON.parse(storageFile),
        keys.storageEncryptionKey,
    );

    return {
        connectionState: ConnectionState.SignedIn,
        db: {
            ...externalData,
        },
    };
}

async function getExistingDatebase(
    storageLocation: StorageLocation,
    storageToken: string | undefined,
    state: GlobalState,
    dispatch: React.Dispatch<Actions>,
    setSignInBtnContent: React.Dispatch<React.SetStateAction<SignInBtnValues>>,
) {
    const keys = await createKeyPairsFromSig(
        state.connection,
        '0',
        setSignInBtnContent,
    );

    const deliveryServiceToken = await reAuth(
        state.connection,
        keys.signingKeyPair.privateKey,
    );

    const storageFile = await getStorageFile(
        storageLocation,
        storageToken!,
        deliveryServiceToken,
        state.connection,
    );

    //If there is no storageFile despite the profile exists the login should fail
    if (!storageFile) {
        dispatch({
            type: ConnectionType.ChangeConnectionState,
            payload: ConnectionState.SignInFailed,
        });
        throw 'Sign in failed';
    }
    //The encrypted session file will now be decrypted, therefore the user has to sign the auth message again.
    const { db, connectionState } = await getSessionFromStorage(
        storageFile,
        keys,
    );

    return { deliveryServiceToken, db, connectionState };
}

async function createNewDatabase(
    state: GlobalState,
    setSignInBtnContent: React.Dispatch<React.SetStateAction<SignInBtnValues>>,
): Promise<{
    connectionState: ConnectionState;
    db: UserDB;
    deliveryServiceToken: string;
    account: Account;
}> {
    const signInData = await signInWithConnection(
        state.connection,
        setSignInBtnContent,
    );
    return signInData;
}

function getOnchainProfile(
    connection: Partial<Connection>,
): SignedUserProfile | undefined {
    if (!connection.account?.profile || !connection.account?.profileSignature) {
        return undefined;
    }
    const { profile, profileSignature } = connection.account;
    return { profile, signature: profileSignature };
}

export async function signProfile(
    provider: ethers.providers.JsonRpcProvider,
    personalSign: ethersHelper.PersonalSign,
    address: string,
    stringifiedProfile: string,
): Promise<string> {
    try {
        const profileCreationMessage =
            getProfileCreationMessage(stringifiedProfile);
        return await personalSign(provider, address, profileCreationMessage);
    } catch (error: any) {
        const err = error?.message.split(':');
        throw Error(err.length > 1 ? err[1] : err[0]);
    }
}

async function createNewProfile(
    connection: Partial<Connection>,
    personalSign: ethersHelper.PersonalSign,
    address: string,
    { signingKeyPair, encryptionKeyPair }: ProfileKeys,
    setSignInBtnContent: React.Dispatch<React.SetStateAction<SignInBtnValues>>,
): Promise<SignedUserProfile> {
    const profile: UserProfile = {
        publicSigningKey: signingKeyPair.publicKey,
        publicEncryptionKey: encryptionKeyPair.publicKey,
        deliveryServices: [globalConfig.DEFAULT_DELIVERY_SERVICE()],
    };

    //Create signed user profile
    const signature = await signProfile(
        connection.provider!,
        personalSign,
        address,
        stringify(profile),
    );

    setSignInBtnContent(SignInBtnValues.SigningIn);
    return { profile, signature };
}

export async function execSignIn(
    connection: Partial<Connection>,
    personalSign: ethersHelper.PersonalSign,
    submitUserProfile: SubmitUserProfile,
    setSignInBtnContent: React.Dispatch<React.SetStateAction<SignInBtnValues>>,
): Promise<{
    connectionState: ConnectionState;
    db: UserDB;
    deliveryServiceToken: string;
    account: Account;
}> {
    const [address] = await connection.provider!.listAccounts();
    const nonce = DEFAULT_NONCE;

    //Create new profileKey pair.
    const profileKeys = await createKeyPairsFromSig(
        connection as Connection,
        nonce,
        setSignInBtnContent,
    );

    const onChainProfile = getOnchainProfile(connection);

    const { profile, signature }: SignedUserProfile =
        onChainProfile ??
        (await createNewProfile(
            connection,
            personalSign,
            address,
            profileKeys,
            setSignInBtnContent,
        ));

    const signedUserProfile: SignedUserProfile = {
        profile,
        signature,
    };

    if (
        !(await claimAddress(
            address,
            process.env.REACT_APP_RESOLVER_BACKEND as string,
            signedUserProfile,
        ))
    ) {
        throw Error(`Couldn't claim address subdomain`);
    }

    const ensName = onChainProfile
        ? connection.account!.ensName
        : address + globalConfig.ADDR_ENS_SUBDOMAIN();

    //Submit newely created UserProfile
    const deliveryServiceToken = await submitUserProfile(
        { ensName, profile },
        connection.provider!,
        { profile, signature },
    );
    const account = {
        ensName,
        profile,
        profileSignature: signature,
    };

    const lol = createDB(profileKeys);

    return {
        connectionState: ConnectionState.SignedIn,
        db: lol,
        deliveryServiceToken,
        account,
    };
}

export async function signInWithConnection(
    connection: Partial<Connection>,
    setSignInBtnContent: React.Dispatch<React.SetStateAction<SignInBtnValues>>,
) {
    return execSignIn(
        connection,
        ethersHelper.prersonalSign,
        submitUserProfile,
        setSignInBtnContent,
    );
}

export async function getDatabase(
    profileExists: boolean,
    storageLocation: StorageLocation,
    storageToken: string | undefined,
    state: GlobalState,
    dispatch: React.Dispatch<Actions>,
    setSignInBtnContent: React.Dispatch<React.SetStateAction<SignInBtnValues>>,
): Promise<{
    connectionState: ConnectionState;
    db: UserDB;
    deliveryServiceToken: string;
    account?: Account;
}> {
    return profileExists
        ? getExistingDatebase(
              storageLocation,
              storageToken,
              state,
              dispatch,
              setSignInBtnContent,
          )
        : createNewDatabase(state, setSignInBtnContent);
}

export async function signIn(
    storageLocation: StorageLocation,
    storageToken: string | undefined,
    state: GlobalState,
    dispatch: React.Dispatch<Actions>,
    setSignInBtnContent: React.Dispatch<React.SetStateAction<SignInBtnValues>>,
) {
    try {
        setSignInBtnContent(SignInBtnValues.WaitingForSigature);

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
                setSignInBtnContent,
            );

        setSignInBtnContent(SignInBtnValues.SigningIn);

        if (!account?.ensName && !state.connection.account) {
            setSignInBtnContent(SignInBtnValues.SignIn);
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
    } catch (error: any) {
        setSignInBtnContent(SignInBtnValues.SignIn);
        const errorMessage = error.message ? error.message.split(':') : error;
        openErrorModal(
            errorMessage.length > 1 ? errorMessage[1] : errorMessage[0],
            false,
        );
        changeSignInButtonStyle(
            'sign-in-btn',
            'normal-btn-hover',
            'normal-btn',
        );
    }
}

async function profileExistsOnDeliveryService(
    connection: Connection,
    ensName: string,
) {
    const url = `${connection.defaultServiceUrl}/profile/${ensName}`;
    try {
        const { status } = await axios.get(url);
        return status === 200;
    } catch (err) {
        return false;
    }
}

async function connectOnchainAccount(
    connection: Connection,
    ensName: string,
    address: string,
) {
    const onChainProfile = await getUserProfile(connection.provider!, ensName);

    /**
     * If it turns out there is no on chain profile available
     * we proceed trying to connect the account with an offchain profile
     */
    if (!onChainProfile) {
        return await connectOffchainAccount(connection, address);
    }
    /**
     * We've to check wether the profile published on chain belongs to the address we're trying to connectÌ
     */
    const isProfileValid = await checkUserProfile(
        connection.provider!,
        onChainProfile,
        address,
    );

    if (!isProfileValid) {
        throw Error('Profile signature is invalid');
    }
    /**
     * We have to check wether this ensName is already registered on the delivery service
     * Wether the account exists or not decides wether we have to call signIn or reAuth later
     */
    const existingAccount = await profileExistsOnDeliveryService(
        connection,
        ensName,
    );
    return {
        account: ensName,
        ethAddress: address,
        //We have to set the state to false so signIn will be called later
        existingAccount,
        connectionState: ConnectionState.SignInReady,
        profile: onChainProfile,
    };
}

export function getAliasForAddress(address: string) {
    return address + globalConfig.ADDR_ENS_SUBDOMAIN();
}

async function connectOffchainAccount(connection: Connection, address: string) {
    try {
        /**
         * We've to check if the use already has a profile on the delivery service
         * if so we can use that account
         * Otherwise we use the addr_ens_subdomain
         */

        const ensName =
            (await getNameForAddress(address, connection.defaultServiceUrl)) ??
            getAliasForAddress(address);

        //We're trying to get the profile from the delivery service
        const profile = await getUserProfile(connection.provider!, ensName);

        return {
            account: ensName,
            ethAddress: address,
            existingAccount: profile !== undefined,
            connectionState: ConnectionState.SignInReady,
            profile,
        };
    } catch (e) {
        log(`Profile not found ` + JSON.stringify(e), 'error');
        /**
         * If there is no profile on the delivery service we start the sign in process
         */
        return {
            account: undefined,
            ethAddress: address,
            existingAccount: false,
            connectionState: ConnectionState.SignInReady,
            profile: undefined,
        };
    }
}

export async function connectEthAccount(
    connection: Connection,
    requestAccounts: ethersHelper.RequestAccounts,
    preSetAccount: string | undefined,
): Promise<{
    account?: string;
    connectionState: ConnectionState;
    existingAccount: boolean;
    profile?: SignedUserProfile;
    ethAddress?: string;
}> {
    if (!connection.provider) {
        throw Error('No Provider');
    }

    try {
        const address =
            preSetAccount ?? (await requestAccounts(connection.provider));

        const ensName = await connection.provider.lookupAddress(address);

        return ensName
            ? await connectOnchainAccount(connection, ensName, address)
            : await connectOffchainAccount(connection, address);
    } catch (e) {
        changeSignInButtonStyle(
            'sign-in-btn',
            'normal-btn-hover',
            'normal-btn',
        );
        log('[connectEthAccount] ' + JSON.stringify(e), 'error');
        return {
            existingAccount: false,
            connectionState: ConnectionState.ConnectionRejected,
        };
    }
}

export async function connectAccount(
    state: GlobalState,
    dispatch: React.Dispatch<Actions>,
    preSetAccount?: string,
) {
    try {
        dispatch({
            type: ConnectionType.ChangeConnectionState,
            payload: ConnectionState.WaitingForAccountConnection,
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
    } catch (error) {
        changeSignInButtonStyle(
            'sign-in-btn',
            'normal-btn-hover',
            'normal-btn',
        );
    }
}

export const getButtonState = (
    connectionState: ConnectionState,
): ButtonState => {
    switch (connectionState) {
        case ConnectionState.SignInFailed:
        case ConnectionState.ConnectionRejected:
            return ButtonState.Failed;

        case ConnectionState.SignInReady:
        case ConnectionState.WaitingForSignIn:
        case ConnectionState.WaitingForAccountConnection:
            return ButtonState.Loading;

        case ConnectionState.SignedIn:
            return ButtonState.Success;

        case ConnectionState.AccountConnectReady:
        case ConnectionState.CollectingSignInData:
        default:
            return ButtonState.Ideal;
    }
};

export async function getWeb3Provider(provider: unknown): Promise<{
    provider?: ethers.providers.Web3Provider;
    connectionState: ConnectionState;
}> {
    return provider
        ? {
              provider: new ethers.providers.Web3Provider(
                  provider as
                      | ethers.providers.ExternalProvider
                      | ethers.providers.JsonRpcFetchFunc,
              ),
              connectionState: ConnectionState.AccountConnectReady,
          }
        : {
              connectionState: ConnectionState.ConnectionRejected,
          };
}

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
        creationsResult.connectionState !== ConnectionState.AccountConnectReady
    ) {
        throw Error('Could not connect to Rainbow wallet');
    }
}

export async function getProvider(
    provider: any | ethers.providers.JsonRpcProvider,
    dispatch: React.Dispatch<Actions>,
) {
    try {
        const web3Provider = await getWeb3Provider(provider);
        handleNewProvider(web3Provider, dispatch);
    } catch (error) {
        changeSignInButtonStyle(
            'sign-in-btn',
            'normal-btn-hover',
            'normal-btn',
        );
    }
}

// fetches icon to show on Sign IN button as a loader
export const getIcon = (btnState: ButtonState) => {
    switch (btnState) {
        case ButtonState.Failed:
            return null;
        case ButtonState.Loading:
            return <img className="rotating" src={loader} alt="loader" />;
        case ButtonState.Success:
            return <img className="rotating" src={loader} alt="loader" />;
        case ButtonState.Ideal:
        case ButtonState.Disabled:
        default:
            return null;
    }
};

// Updates the button style
export function changeSignInButtonStyle(
    id: string,
    classOne: string,
    classTwo: string,
) {
    const element = document.getElementById(id) as HTMLElement;
    element.classList.remove(classOne);
    element.classList.add(classTwo);
}
