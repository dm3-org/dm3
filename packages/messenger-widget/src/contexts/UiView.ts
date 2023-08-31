import { log } from 'dm3-lib-shared';
import { UiViewState } from '../interfaces/context';
import { UiViewStateActions, UiViewStateType } from '../utils/enum-type-utils';

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

        default:
            return state;
    }
}
