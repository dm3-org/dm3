import { Account } from '@dm3-org/dm3-lib-profile';
import { ethers } from 'ethers';
import { Socket } from 'socket.io-client';
import { DefaultEventsMap } from 'socket.io/dist/typed-events';
import { Modal, UiState, UiViewState } from '../interfaces/context';
import { MessageAction, MessageProps } from '../interfaces/props';
import { NewContact } from '../interfaces/utils';
import { Connection } from '../interfaces/web3';
import { DM3Configuration } from '../interfaces/config';

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
    [ConnectionType.ChangeConnectionState]: ConnectionState;
    [ConnectionType.ChangeSocket]: Socket<DefaultEventsMap, DefaultEventsMap>;
    [ConnectionType.ChangeAccount]: Account;
    [ConnectionType.ChangeEthAddress]: string;
    [ConnectionType.ChangeProvider]: ethers.providers.JsonRpcProvider;
    [ConnectionType.ChangeStorageToken]: string | undefined;
    [ConnectionType.ChangeStorageLocation]: any;
    [ConnectionType.SetDefaultServiceUrl]: string;
    [ConnectionType.Reset]: any;
};

export type ConnectionActions =
    ActionMap<ConnectionPayload>[keyof ActionMap<ConnectionPayload>];

export type GlobalState = {
    connection: Connection;
    uiState: UiState;
    uiView: UiViewState;
    modal: Modal;
    dm3Configuration: DM3Configuration;
};

export type UiStatePayload = {
    [UiStateType.SetProfileExists]: boolean;
    [UiStateType.SetBrowserStorageBackup]: boolean;
    [UiStateType.Reset]: any;
};

export type UiStateActions =
    ActionMap<UiStatePayload>[keyof ActionMap<UiStatePayload>];

export type Actions =
    | ConnectionActions
    | UiStateActions
    | UiViewStateActions
    | ModalStateActions
    | DM3ConfigurationStateActions;

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

export enum SelectedRightView {
    Error,
    Chat,
    UserInfo,
}

export enum UiStateType {
    SetProfileExists = 'SET_PROFILE_EXISTS',
    SetBrowserStorageBackup = 'SET_BROWSER_STORAGE_BACKUP',
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

export enum UiViewStateType {
    SetSelectedRightView = 'SET_SELECTED_RIGHT_VIEW',
    SetSelectedLeftView = 'SET_SELECTED_LEFT_VIEW',
    SetMessageView = 'SET_MESSAGE_VIEW',
    Reset = 'RESET',
}

export type UiViewStatePayload = {
    [UiViewStateType.SetSelectedLeftView]: LeftViewSelected;
    [UiViewStateType.SetSelectedRightView]: RightViewSelected;
    [UiViewStateType.SetMessageView]: MessageAction;
    [UiViewStateType.Reset]: any;
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
    ShowPreferencesModal = 'SHOW_PREFERENCES_MODAL',
    Reset = 'RESET',
}

export enum DM3ConfigurationStateType {
    DM3Configuration = 'DM3_CONFIGURATION',
}

export type DM3ConfigurationStatePayload = {
    [DM3ConfigurationStateType.DM3Configuration]: DM3Configuration;
};

export type DM3ConfigurationStateActions =
    ActionMap<DM3ConfigurationStatePayload>[keyof ActionMap<DM3ConfigurationStatePayload>];

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
