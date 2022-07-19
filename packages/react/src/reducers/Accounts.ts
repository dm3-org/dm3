import * as Lib from 'dm3-lib';
import { AccountInfo, Accounts, ActionMap } from './shared';

export enum AccountsType {
    SetSelectedContact = 'SET_SELECTED_CONTACT',
    SetContacts = 'SET_CONTACTS',
    SetAccountInfoView = 'ACCOUNT_INFO_VIEW',
}

export type AccountsPayload = {
    [AccountsType.SetSelectedContact]: Lib.Account | undefined;
    [AccountsType.SetContacts]: Lib.Account[] | undefined;
    [AccountsType.SetAccountInfoView]: AccountInfo;
};

export type AccountsActions =
    ActionMap<AccountsPayload>[keyof ActionMap<AccountsPayload>];

export function accountsReducer(state: Accounts, action: AccountsActions) {
    switch (action.type) {
        case AccountsType.SetSelectedContact:
            if (state.selectedContact === action.payload?.address) {
                return state;
            } else {
                Lib.log(
                    `[Accounts] Set selected account to ${action.payload?.address}`,
                );

                return {
                    ...state,
                    selectedContact: action.payload,
                };
            }

        case AccountsType.SetContacts:
            Lib.log(
                `[Accounts] Set ${
                    action.payload ? action.payload.length : '0'
                } contacts`,
            );
            return {
                ...state,
                contacts: action.payload,
            };

        case AccountsType.SetAccountInfoView:
            if (state.accountInfoView === action.payload) {
                return state;
            } else {
                Lib.log(`[Accounts] Set account info view ${action.payload}`);
                return {
                    ...state,
                    accountInfoView: action.payload,
                };
            }

        default:
            return state;
    }
}
