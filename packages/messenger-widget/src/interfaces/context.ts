import { Account, DeliveryServiceProfile } from '@dm3-org/dm3-lib-profile';
import { ContactPreview } from './utils';

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
    contacts: ContactPreview[] | null;
    lastConversation: {
        account: Account | null;
        message: string | null;
    };
    messageSizeLimit: number;
    accountName: string;
}
