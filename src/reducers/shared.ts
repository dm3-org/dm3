import * as Lib from '../lib';

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
    contacts: Lib.Account[] | undefined;
    selectedContact: Lib.Account | undefined;
};

export type GlobalState = {
    connection: Lib.Connection;
    accounts: Accounts;
    ensNames: Map<string, string>;
    userDb: Lib.UserDB | undefined;
};

export const initialState: GlobalState = {
    connection: {
        connectionState: Lib.ConnectionState.CheckingProvider,
        storageLocation: Lib.StorageLocation.File,
    },
    accounts: {
        contacts: undefined,
        selectedContact: undefined,
    },
    ensNames: new Map<string, string>(),
    userDb: undefined,
};
