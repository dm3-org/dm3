import { log } from 'dm3-lib-shared';
import { Modal } from '../interfaces/context';
import { ModalStateActions, ModalStateType } from '../utils/enum-type-utils';

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

        default:
            return state;
    }
}
