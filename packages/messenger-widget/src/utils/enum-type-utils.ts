import {
    AuthSession,
    AuthState,
    Cache,
    Contact,
    UiState,
} from '../interfaces/context';
import { ethers } from 'ethers';
import { Socket } from 'socket.io-client';
import { DefaultEventsMap } from 'socket.io/dist/typed-events';
import {
    StorageEnvelopContainer,
    StorageLocation,
    SyncProcessState,
    UserDB,
} from 'dm3-lib-storage';
import { Account } from 'dm3-lib-profile';
import { Connection } from '../interfaces/web3';

export type ActionMap<M extends { [index: string]: any }> = {
    [Key in keyof M]: M[Key] extends undefined
        ? {
              type: Key;
          }
        : {
              type: Key;
              payload: M[Key];
          };
};

export type Accounts = {
    contacts: Contact[] | undefined;
    selectedContact: Contact | undefined;
    accountInfoView: AccountInfo;
};

export type AccountsPayload = {
    [AccountsType.SetSelectedContact]: Contact | undefined;
    [AccountsType.SetContacts]: Contact[] | undefined;
    [AccountsType.SetAccountInfoView]: AccountInfo;
    [AccountsType.RemoveContact]: string;
};

export type AccountsActions =
    ActionMap<AccountsPayload>[keyof ActionMap<AccountsPayload>];

export type AuthStatePayload = {
    [AuthStateType.AddNewSession]: AuthSession;
};

export type AuthStateActions =
    ActionMap<AuthStatePayload>[keyof ActionMap<AuthStatePayload>];

export type CachePayload = {
    [CacheType.AddAbis]: { address: string; abi: string }[];
    [CacheType.AddAvatarUrl]: { ensName: string; url: string };
};

export type CacheActions =
    ActionMap<CachePayload>[keyof ActionMap<CachePayload>];

export type ConnectionPayload = {
    [ConnectionType.ChangeConnectionState]: ConnectionState;
    [ConnectionType.ChangeSocket]: Socket<DefaultEventsMap, DefaultEventsMap>;
    [ConnectionType.ChangeAccount]: Account;
    [ConnectionType.ChangeEthAddress]: string;
    [ConnectionType.ChangeProvider]: ethers.providers.JsonRpcProvider;
    [ConnectionType.ChangeStorageToken]: string | undefined;
    [ConnectionType.ChangeStorageLocation]: StorageLocation;
    [ConnectionType.SetDefaultServiceUrl]: string;
};

export type ConnectionActions =
    ActionMap<ConnectionPayload>[keyof ActionMap<ConnectionPayload>];

export type GlobalState = {
    connection: Connection;
    accounts: Accounts;
    cache: Cache;
    userDb: UserDB | undefined;
    uiState: UiState;
    auth: AuthState;
};

export type UserDbPayload = {
    [UserDbType.addMessage]: {
        container: StorageEnvelopContainer;
        connection: Connection;
    };
    [UserDbType.setDB]: UserDB;
    [UserDbType.createEmptyConversation]: string;
    [UserDbType.setSynced]: boolean;
    [UserDbType.setConfigViewed]: boolean;
    [UserDbType.setSyncProcessState]: SyncProcessState;
    [UserDbType.hideContact]: { ensName: string; aka?: string };
    [UserDbType.unhideContact]: string;
};

export type UserDbActions =
    ActionMap<UserDbPayload>[keyof ActionMap<UserDbPayload>];

export type UiStatePayload = {
    [UiStateType.SetShowAddContact]: boolean;
    [UiStateType.SetSelectedRightView]: SelectedRightView;
    [UiStateType.SetMaxLeftView]: boolean;
    [UiStateType.ToggleShow]: undefined;
    [UiStateType.SetLastMessagePull]: number;
    [UiStateType.SetProfileExists]: boolean;
    [UiStateType.SetBrowserStorageBackup]: boolean;
};

export type UiStateActions =
    ActionMap<UiStatePayload>[keyof ActionMap<UiStatePayload>];

export type Actions =
    | ConnectionActions
    | CacheActions
    | AccountsActions
    | UserDbActions
    | UiStateActions
    | AuthStateActions;

export enum AccountsType {
    SetSelectedContact = 'SET_SELECTED_CONTACT',
    SetContacts = 'SET_CONTACTS',
    SetAccountInfoView = 'ACCOUNT_INFO_VIEW',
    RemoveContact = 'REMOVE_CONTACT',
}

export enum AccountInfo {
    None,
    Contact,
    Account,
    DomainConfig,
}

export enum AuthStateType {
    AddNewSession = 'ADD_NEW_SESSION',
}

export enum CacheType {
    AddEnsName = 'ADD_ENS_NAME',
    AddAbis = 'ADD_ABIS',
    AddAvatarUrl = 'ADD_AVATAR_URL',
}

export enum ConnectionType {
    ChangeConnectionState = 'CHANGE_CONNECTION_STATE',
    ChangeSocket = 'CHANGE_SOCKET',
    ChangeAccount = 'CHANGE_ACCOUNT',
    ChangeEthAddress = 'CHANGE_ETH_ADDRESS',
    ChangeProvider = 'CHANGE_PROVIDER',
    ChangeStorageToken = 'CHANGE_STORAGE_TOKEN',
    ChangeStorageLocation = 'CHANGE_STORAGE_LOCATION',
    SetDefaultServiceUrl = 'SET_DEFAULT_SERVICE_URL',
}

export enum UserDbType {
    addMessage = 'ADD_MESSAGE',
    setDB = 'SET_DB',
    createEmptyConversation = 'CREATE_EMPTY_CONVERSATION',
    setSynced = 'SET_SYNCED',
    setConfigViewed = 'SET_CONFIG_VIEWED',
    setSyncProcessState = 'SET_SYNC_PROCESS_STATE',
    hideContact = 'HIDE_CONTACT',
    unhideContact = 'UNHIDE_CONTACT',
}

export enum SelectedRightView {
    Error,
    Chat,
    UserInfo,
}

export enum UiStateType {
    SetShowAddContact = 'SET_SHOW_ADD_CONTACT',
    SetSelectedRightView = 'SET_SELECTED_RIGHT_VIEW',
    SetMaxLeftView = 'SET_MAX_LEFT_VIEW',
    ToggleShow = 'ToggleShow',
    SetLastMessagePull = 'SET_LAST_MESSAGE_PULL',
    SetProfileExists = 'SET_PROFILE_EXISTS',
    SetBrowserStorageBackup = 'SET_BROWSER_STORAGE_BACKUP',
}

export enum ConnectionState {
    CollectingSignInData,
    SignInReady,
    AccountConnectReady,
    WaitingForAccountConnection,
    WaitingForSignIn,
    ConnectionRejected,
    SignInFailed,
    SignedIn,
}

export enum GoogleAuthState {
    Ready,
    Pending,
    Success,
    Failed,
}

export enum ButtonState {
    Ideal,
    Failed,
    Loading,
    Success,
    Disabled,
}

export enum SignInBtnValues {
    SignIn = 'Sign In',
    WaitingForSigature = 'Waiting for signature...',
    SigningIn = 'Signing In',
}
