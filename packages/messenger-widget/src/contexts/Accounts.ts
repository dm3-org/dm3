import { log } from 'dm3-lib-shared';
import {
    Accounts,
    AccountsActions,
    AccountsType,
} from '../utils/enum-type-utils';
import { normalizeEnsName } from 'dm3-lib-profile';

export function accountsReducer(state: Accounts, action: AccountsActions) {
    switch (action.type) {
        case AccountsType.SetSelectedContact:
            if (state.selectedContact === action.payload?.account.ensName) {
                return state;
            } else {
                log(
                    `[Accounts] Set selected account to ${action.payload?.account.ensName}`,
                    'info',
                );

                return {
                    ...state,
                    selectedContact: action.payload && {
                        ...action.payload,
                        account: {
                            ...action.payload.account,
                            ensName: normalizeEnsName(
                                action.payload.account.ensName,
                            ),
                        },
                    },
                };
            }

        case AccountsType.SetContacts:
            log(
                `[Accounts] Set ${
                    action.payload ? action.payload.length : '0'
                } contacts`,
                'info',
            );
            return {
                ...state,
                contacts: action.payload,
            };

        case AccountsType.Reset:
            log(`[Accounts] reset`, 'info');
            return {
                contacts: undefined,
                selectedContact: undefined,
                reset: undefined,
            };

        default:
            return state;
    }
}
