import { Account } from 'dm3-lib-profile';
import {
    StorageEnvelopContainer,
    StorageLocation,
    SyncProcessState,
    UserDB,
} from 'dm3-lib-storage';
import { ethers } from 'ethers';
import { Socket } from 'socket.io-client';
import { DefaultEventsMap } from 'socket.io/dist/typed-events';
import {
    AuthSession,
    AuthState,
    Cache,
    Contact,
    Modal,
    UiState,
    UiViewState,
} from '../interfaces/context';
import { MessageAction, MessageProps } from '../interfaces/props';
import { ContactPreview, NewContact } from '../interfaces/utils';
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
};

export type AccountsPayload = {
    [AccountsType.SetSelectedContact]: Contact | undefined;
    [AccountsType.SetContacts]: Contact[] | undefined;
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
    [CacheType.Contacts]: ContactPreview[] | null;
    [CacheType.LastConversation]: {
        account: Account | null;
        message: string | null;
    };
    [CacheType.MessageSizeLimit]: number;
    [CacheType.AccountName]: string;
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
    uiView: UiViewState;
    modal: Modal;
};

export type UserDbPayload = {
    [UserDbType.addMessage]: {
        container: StorageEnvelopContainer;
        account: Account;
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
    | AuthStateActions
    | UiViewStateActions
    | ModalStateActions;

export enum AccountsType {
    SetSelectedContact = 'SET_SELECTED_CONTACT',
    SetContacts = 'SET_CONTACTS',
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
    Contacts = 'CONTACTS',
    LastConversation = 'LAST_CONVERSATION',
    MessageSizeLimit = 'MESSAGE_SIZE_LIMIT',
    AccountName = 'ACCOUNT_NAME',
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

export enum RightViewSelected {
    Chat,
    ContactInfo,
    Profile,
    Default,
}

export enum LeftViewSelected {
    Contacts,
    Menu,
}

export enum UiViewStateType {
    SetSelectedRightView = 'SET_SELECTED_RIGHT_VIEW',
    SetSelectedLeftView = 'SET_SELECTED_LEFT_VIEW',
    SetMessageView = 'SET_MESSAGE_VIEW',
}

export type UiViewStatePayload = {
    [UiViewStateType.SetSelectedLeftView]: LeftViewSelected;
    [UiViewStateType.SetSelectedRightView]: RightViewSelected;
    [UiViewStateType.SetMessageView]: MessageAction;
};

export type UiViewStateActions =
    ActionMap<UiViewStatePayload>[keyof ActionMap<UiViewStatePayload>];

export enum ModalStateType {
    LoaderContent = 'LOADER_CONTENT',
    AddConversationData = 'ADD_CONVERSATION_DATA',
    ContactToHide = 'CONTACT_TO_HIDE',
    OpenEmojiPopup = 'OPEN_EMOJI_MODAL',
    LastMessageAction = 'LAST_MESSAGE_ACTION',
    IsProfileConfigurationPopupActive = 'IS_PROFILE_CONFIGURATION_POPUP_ACTIVE',
}

export type ModalStatePayload = {
    [ModalStateType.LoaderContent]: string;
    [ModalStateType.AddConversationData]: NewContact;
    [ModalStateType.ContactToHide]: string | undefined;
    [ModalStateType.OpenEmojiPopup]: {
        action: boolean;
        data: MessageProps | undefined;
    };
    [ModalStateType.LastMessageAction]: MessageActionType;
    [ModalStateType.IsProfileConfigurationPopupActive]: boolean;
};

export type ModalStateActions =
    ActionMap<ModalStatePayload>[keyof ActionMap<ModalStatePayload>];

export enum MessageActionType {
    NEW = 'NEW',
    EDIT = 'EDIT',
    DELETE = 'DELETE_REQUEST',
    REPLY = 'REPLY',
    REACT = 'REACTION',
    NONE = 'NONE',
}
