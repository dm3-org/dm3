import * as Lib from 'dm3-lib';
import { AuthState } from './Auth';
import { Cache } from './Cache';
import { SelectedRightView, UiState } from './UiState';

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
    account: Lib.account.Account;
    deliveryServiceProfile?: Lib.delivery.DeliveryServiceProfile;
}

export type Accounts = {
    contacts: Contact[] | undefined;
    selectedContact: Contact | undefined;
    accountInfoView: AccountInfo;
};

export type GlobalState = {
    connection: Lib.Connection;
    accounts: Accounts;
    cache: Cache;
    userDb: Lib.storage.UserDB | undefined;
    uiState: UiState;
    auth: AuthState;
};

export enum AccountInfo {
    None,
    Contact,
    Account,
}

export const initialState: GlobalState = {
    connection: {
        connectionState: Lib.web3provider.ConnectionState.CollectingSignInData,
        storageLocation: Lib.storage.StorageLocation.dm3Storage,
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
