import { Account } from '@dm3-org/dm3-lib-profile';
import { Modal } from '../interfaces/context';
import { MessageProps } from '../interfaces/props';
import { NewContact } from '../interfaces/utils';

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

export type ConnectionPayload = {
    [ConnectionType.ChangeAccount]: Account;
    [ConnectionType.Reset]: any;
};

export type ConnectionActions =
    ActionMap<ConnectionPayload>[keyof ActionMap<ConnectionPayload>];

export type GlobalState = {
    modal: Modal;
};

export type Actions = ConnectionActions | ModalStateActions;

export enum ConnectionType {
    ChangeConnectionState = 'CHANGE_CONNECTION_STATE',
    ChangeSocket = 'CHANGE_SOCKET',
    ChangeAccount = 'CHANGE_ACCOUNT',
    ChangeEthAddress = 'CHANGE_ETH_ADDRESS',
    ChangeProvider = 'CHANGE_PROVIDER',
    ChangeStorageToken = 'CHANGE_STORAGE_TOKEN',
    ChangeStorageLocation = 'CHANGE_STORAGE_LOCATION',
    SetDefaultServiceUrl = 'SET_DEFAULT_SERVICE_URL',
    Reset = 'RESET',
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

export enum ModalStateType {
    LoaderContent = 'LOADER_CONTENT',
    AddConversationData = 'ADD_CONVERSATION_DATA',
    ContactToHide = 'CONTACT_TO_HIDE',
    OpenEmojiPopup = 'OPEN_EMOJI_MODAL',
    LastMessageAction = 'LAST_MESSAGE_ACTION',
    IsProfileConfigurationPopupActive = 'IS_PROFILE_CONFIGURATION_POPUP_ACTIVE',
    ShowPreferencesModal = 'SHOW_PREFERENCES_MODAL',
    Reset = 'RESET',
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
    [ModalStateType.ShowPreferencesModal]: boolean;
    [ModalStateType.Reset]: any;
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
