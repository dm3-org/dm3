import { Account, DeliveryServiceProfile } from 'dm3-lib-profile';
import {
    LeftViewSelected,
    RightViewSelected,
    SelectedRightView,
} from '../utils/enum-type-utils';

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
}

export interface UiViewState {
    selectedLeftView: LeftViewSelected;
    selectedRightView: RightViewSelected;
}
