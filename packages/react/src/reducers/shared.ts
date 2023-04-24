import { Account, DeliveryServiceProfile } from 'dm3-lib-profile';
import { AuthState } from './Auth';
import { Cache } from './Cache';
import { SelectedRightView, UiState } from './UiState';
import { StorageLocation, UserDB } from 'dm3-lib-storage';
import { Connection, ConnectionState } from '../web3provider/Web3Provider';

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

export interface Contact {
    account: Account;
    deliveryServiceProfile?: DeliveryServiceProfile;
}

export type Accounts = {
    contacts: Contact[] | undefined;
    selectedContact: Contact | undefined;
    accountInfoView: AccountInfo;
};

export type GlobalState = {
    connection: Connection;
    accounts: Accounts;
    cache: Cache;
    userDb: UserDB | undefined;
    uiState: UiState;
    auth: AuthState;
};

export enum AccountInfo {
    None,
    Contact,
    Account,
    DomainConfig,
}

export const initialState: GlobalState = {
    connection: {
        connectionState: ConnectionState.CollectingSignInData,
        storageLocation: StorageLocation.dm3Storage,
        defaultServiceUrl: process.env.REACT_APP_BACKEND as string,
    },
    accounts: {
        contacts: undefined,
        selectedContact: undefined,
        accountInfoView: AccountInfo.None,
    },
    cache: {
        abis: new Map<string, string>(),
        avatarUrls: new Map<string, string>(),
    },
    userDb: undefined,
    uiState: {
        showAddContact: false,
        selectedRightView: SelectedRightView.Chat,
        maxLeftView: true,
        show: false,
        lastMessagePull: 0,
        proflieExists: false,
        browserStorageBackup: false,
    },
    auth: {
        currentSession: undefined,
        recentlyUsedSession: undefined,
        allSessions: {},
    },
};
