import { log } from '@dm3-org/dm3-lib-shared';
import { UiState } from '../interfaces/context';
import { UiStateActions, UiStateType } from '../utils/enum-type-utils';

export function uiStateReducer(
    state: UiState,
    action: UiStateActions,
): UiState {
    switch (action.type) {
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

        case UiStateType.Reset:
            log(`[UI] reset`, 'info');
            return {
                lastMessagePull: 0,
                proflieExists: false,
                browserStorageBackup: false,
            };

        default:
            return state;
    }
}
