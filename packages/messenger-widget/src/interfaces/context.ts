import { Account, DeliveryServiceProfile } from 'dm3-lib-profile';
import {
    LeftViewSelected,
    MessageActionType,
    RightViewSelected,
    SelectedRightView,
} from '../utils/enum-type-utils';
import { ContactPreview, NewContact } from './utils';
import { MessageAction, MessageProps } from './props';

export interface Contact {
    account: Account;
    deliveryServiceProfile?: DeliveryServiceProfile;
}

export interface AuthState {
    allSessions: { [address: string]: AuthSession };
    currentSession?: AuthSession;
    recentlyUsedSession?: string;
}

export interface AuthSession {
    storage: string;
    token: string;
    ensName: string;
    storageEncryptionKey?: string;
}

export interface Cache {
    abis: Map<string, string>;
    avatarUrls: Map<string, string>;
    contacts: ContactPreview[] | null;
    lastConversation: {
        account: Account | null;
        message: string | null;
    };
}

export interface UiState {
    showAddContact: boolean;
    selectedRightView: SelectedRightView;
    maxLeftView: boolean;
    show: boolean;
    lastMessagePull: number;
    proflieExists: boolean;
    browserStorageBackup: boolean;
    showContactList: boolean;
}

export interface GlobalContextProviderProps {
    children: JSX.Element;
}

export interface Modal {
    loaderContent: string;
    addConversation: NewContact;
    contactToHide: string | undefined;
    openEmojiPopup: { action: boolean; data: MessageProps | undefined };
    lastMessageAction: MessageActionType;
}

export interface UiViewState {
    selectedLeftView: LeftViewSelected;
    selectedRightView: RightViewSelected;
    selectedMessageView: MessageAction;
}
