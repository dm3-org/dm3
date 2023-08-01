import { log } from 'dm3-lib-shared';
import { RightView } from '../interfaces/context';
import { RightViewStateActions, RightViewStateType } from '../utils/enum-type-utils';

export function rightViewReducer(
  state: RightView,
  action: RightViewStateActions,
): RightView {
  switch (action.type) {

    case RightViewStateType.ShowDefaultChat:
      log(
        `[RightView] set show default chat ${action.payload}`,
        'info',
      );
      return {
        ...state,
        showDefaultChat: action.payload,
      };

    case RightViewStateType.ShowContact:
      log(
        `[RightView] set show contact ${action.payload}`,
        'info',
      );
      return {
        ...state,
        showContact: action.payload,
      };

    case RightViewStateType.ShowHeader:
      log(
        `[RightView] set show header ${action.payload}`,
        'info',
      );
      return {
        ...state,
        showHeader: action.payload,
      };

    case RightViewStateType.ShowProfile:
      log(
        `[RightView] set show profile ${action.payload}`,
        'info',
      );
      return {
        ...state,
        showProfile: action.payload,
      };

    case RightViewStateType.ShowChat:
      log(
        `[RightView] set show chat ${action.payload}`,
        'info',
      );
      return {
        ...state,
        showChat: action.payload,
      };

    case RightViewStateType.ShowProfileConfigPopup:
      log(
        `[RightView] set show profile config popup ${action.payload}`,
        'info',
      );
      return {
        ...state,
        showProfileConfigPopup: action.payload,
      };

    default:
      return state;
  }
}