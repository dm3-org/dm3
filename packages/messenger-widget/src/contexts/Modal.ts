import { log } from '@dm3-org/dm3-lib-shared';
import { Modal } from '../interfaces/context';
import {
    MessageActionType,
    ModalStateActions,
    ModalStateType,
} from '../utils/enum-type-utils';

export function modalReducer(state: Modal, action: ModalStateActions): Modal {
    switch (action.type) {
        case ModalStateType.LoaderContent:
            log(`[Modal] set loader content ${action.payload}`, 'info');
            return {
                ...state,
                loaderContent: action.payload,
            };

        case ModalStateType.AddConversationData:
            log(
                `[New Conversation] set new conversation content ${action.payload}`,
                'info',
            );
            return {
                ...state,
                addConversation: action.payload,
            };

        case ModalStateType.ContactToHide:
            log(`[Contact to hide] Contact content ${action.payload}`, 'info');
            return {
                ...state,
                contactToHide: action.payload,
            };

        case ModalStateType.OpenEmojiPopup:
            log(`[Emoji Popup] open ${action.payload}`, 'info');
            return {
                ...state,
                openEmojiPopup: action.payload,
            };

        case ModalStateType.LastMessageAction:
            log(`[Last message action] type ${action.payload}`, 'info');
            return {
                ...state,
                lastMessageAction: action.payload,
            };

        case ModalStateType.IsProfileConfigurationPopupActive:
            log(`[Profile configuration popup] open ${action.payload}`, 'info');
            return {
                ...state,
                isProfileConfigurationPopupActive: action.payload,
            };

        case ModalStateType.ShowPreferencesModal:
            log(`[Show Preferences popup] ${action.payload}`, 'info');
            return {
                ...state,
                showPreferencesModal: action.payload,
            };

        case ModalStateType.Reset:
            log(`[Modal] reset`, 'info');
            return {
                loaderContent: '',
                contactToHide: undefined,
                addConversation: {
                    active: false,
                    ensName: undefined,
                    processed: false,
                },
                openEmojiPopup: { action: false, data: undefined },
                lastMessageAction: MessageActionType.NONE,
                isProfileConfigurationPopupActive: false,
                showPreferencesModal: false,
                reset: undefined,
            };

        default:
            return state;
    }
}
