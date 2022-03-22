import * as Lib from '../lib';
import { Accounts, ActionMap } from './shared';

export enum AccountsType {
    SetSelectedContact = 'SET_SELECTED_CONTACT',
    SetContacts = 'SET_CONTACTS',
}

export type AccountsPayload = {
    [AccountsType.SetSelectedContact]: Lib.Account | undefined;
    [AccountsType.SetContacts]: Lib.Account[] | undefined;
};

export type AccountsActions =
    ActionMap<AccountsPayload>[keyof ActionMap<AccountsPayload>];

export function accountsReducer(state: Accounts, action: AccountsActions) {
    switch (action.type) {
        case AccountsType.SetSelectedContact:
            Lib.log(`Set selected account to ${action.payload?.address}`);
            return {
                ...state,
                selectedContact: action.payload,
            };

        case AccountsType.SetContacts:
            Lib.log(
                `Set ${action.payload ? action.payload.length : '0'} contacts`,
            );
            return {
                ...state,
                contacts: action.payload,
            };

        default:
            return state;
    }
}
