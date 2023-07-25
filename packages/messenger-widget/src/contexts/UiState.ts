import { log } from 'dm3-lib-shared';
import { UiState } from '../interfaces/context';
import { UiStateActions, UiStateType } from '../utils/enum-type-utils';

export function uiStateReducer(
    state: UiState,
    action: UiStateActions,
): UiState {
    switch (action.type) {
        case UiStateType.SetShowAddContact:
            if (state.showAddContact === action.payload) {
                return state;
            } else {
                log(`[UI] Set show add contact form ${action.payload}`, 'info');
                return {
                    ...state,
                    showAddContact: action.payload,
                };
            }

        case UiStateType.SetSelectedRightView:
            if (state.selectedRightView === action.payload) {
                return state;
            } else {
                log(`[UI] Change right view to ${action.payload}`, 'info');
                return {
                    ...state,
                    selectedRightView: action.payload,
                };
            }

        case UiStateType.SetMaxLeftView:
            log(`[UI] maxLeftView: ${action.payload}`, 'info');
            return {
                ...state,
                maxLeftView: action.payload,
            };

        case UiStateType.ToggleShow:
            log(`[UI] toggle show`, 'info');
            return {
                ...state,
                show: !state.show,
            };

        case UiStateType.SetLastMessagePull:
            log(`[UI] set timestamp of last message pull`, 'info');
            return {
                ...state,
                lastMessagePull: action.payload,
            };

        case UiStateType.SetProfileExists:
            log(`[UI] set profile exists to ${action.payload}`, 'info');
            return {
                ...state,
                proflieExists: action.payload,
            };

        case UiStateType.SetBrowserStorageBackup:
            log(
                `[UI] set create browser storage backups to ${action.payload}`,
                'info',
            );
            return {
                ...state,
                browserStorageBackup: action.payload,
            };

        default:
            return state;
    }
}
