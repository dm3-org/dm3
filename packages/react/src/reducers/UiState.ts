import { ActionMap } from './shared';
import * as Lib from 'dm3-lib';
import { stat } from 'fs';

export enum SelectedRightView {
    Error,
    Chat,
    UserInfo,
}

export interface UiState {
    showAddContact: boolean;
    selectedRightView: SelectedRightView;
    maxLeftView: boolean;
    show: boolean;
    lastMessagePull: number;
    proflieExists: boolean;
    browserStorageBackup: boolean;
}

export enum UiStateType {
    SetShowAddContact = 'SET_SHOW_ADD_CONTACT',
    SetSelectedRightView = 'SET_SELECTED_RIGHT_VIEW',
    SetMaxLeftView = 'SET_MAX_LEFT_VIEW',
    ToggleShow = 'ToggleShow',
    SetLastMessagePull = 'SET_LAST_MESSAGE_PULL',
    SetProfileExists = 'SET_PROFILE_EXISTS',
    SetBrowserStorageBackup = 'SET_BROWSER_STORAGE_BACKUP',
}

export type UiStatePayload = {
    [UiStateType.SetShowAddContact]: boolean;
    [UiStateType.SetSelectedRightView]: SelectedRightView;
    [UiStateType.SetMaxLeftView]: boolean;
    [UiStateType.ToggleShow]: undefined;
    [UiStateType.SetLastMessagePull]: number;
    [UiStateType.SetProfileExists]: boolean;
    [UiStateType.SetBrowserStorageBackup]: boolean;
};

export type UiStateActions =
    ActionMap<UiStatePayload>[keyof ActionMap<UiStatePayload>];

export function uiStateReducer(
    state: UiState,
    action: UiStateActions,
): UiState {
    switch (action.type) {
        case UiStateType.SetShowAddContact:
            if (state.showAddContact === action.payload) {
                return state;
            } else {
                Lib.log(`[UI] Set show add contact form ${action.payload}`);
                return {
                    ...state,
                    showAddContact: action.payload,
                };
            }

        case UiStateType.SetSelectedRightView:
            if (state.selectedRightView === action.payload) {
                return state;
            } else {
                Lib.log(`[UI] Change right view to ${action.payload}`);
                return {
                    ...state,
                    selectedRightView: action.payload,
                };
            }

        case UiStateType.SetMaxLeftView:
            Lib.log(`[UI] maxLeftView: ${action.payload}`);
            return {
                ...state,
                maxLeftView: action.payload,
            };

        case UiStateType.ToggleShow:
            Lib.log(`[UI] toggle show`);
            return {
                ...state,
                show: !state.show,
            };

        case UiStateType.SetLastMessagePull:
            Lib.log(`[UI] set timestamp of last message pull`);
            return {
                ...state,
                lastMessagePull: action.payload,
            };

        case UiStateType.SetProfileExists:
            Lib.log(`[UI] set profile exists to ${action.payload}`);
            return {
                ...state,
                proflieExists: action.payload,
            };

        case UiStateType.SetBrowserStorageBackup:
            Lib.log(
                `[UI] set create browser storage backups to ${action.payload}`,
            );
            return {
                ...state,
                browserStorageBackup: action.payload,
            };

        default:
            return state;
    }
}
