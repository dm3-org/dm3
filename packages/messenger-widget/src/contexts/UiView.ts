import { log } from '@dm3-org/dm3-lib-shared';
import { UiViewState } from '../interfaces/context';
import {
    LeftViewSelected,
    MessageActionType,
    RightViewSelected,
    UiViewStateActions,
    UiViewStateType,
} from '../utils/enum-type-utils';

export function uiViewReducer(
    state: UiViewState,
    action: UiViewStateActions,
): UiViewState {
    switch (action.type) {
        case UiViewStateType.SetSelectedLeftView:
            log(`[UI] set left view ${action.payload}`, 'info');
            return {
                ...state,
                selectedLeftView: action.payload,
            };

        case UiViewStateType.SetSelectedRightView:
            log(`[UI] set right view ${action.payload}`, 'info');
            return {
                ...state,
                selectedRightView: action.payload,
            };

        case UiViewStateType.SetMessageView:
            log(`[UI] set message view ${action.payload}`, 'info');
            return {
                ...state,
                selectedMessageView: action.payload,
            };

        case UiViewStateType.Reset:
            log(`[UI] reset`, 'info');
            return {
                selectedLeftView: LeftViewSelected.Contacts,
                selectedRightView: RightViewSelected.Default,
                selectedMessageView: {
                    messageData: undefined,
                    actionType: MessageActionType.NONE,
                },
                reset: undefined,
            };

        default:
            return state;
    }
}
