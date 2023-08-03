import { ENS_PROFILE_BASE_URL } from '../../utils/common-utils';
import {
    AccountsType,
    Actions,
    RightViewSelected,
    UiViewStateType,
} from '../../utils/enum-type-utils';

export const onClose = (dispatch: React.Dispatch<Actions>) => {
    dispatch({
        type: UiViewStateType.SetSelectedRightView,
        payload: RightViewSelected.Default,
    });
    dispatch({
        type: AccountsType.SetSelectedContact,
        payload: undefined,
    });
};

export const openEnsProfile = (ensName: string) => {
    window.open(ENS_PROFILE_BASE_URL + ensName, '_blank');
};

export const openProfileConfigureBox = (dispatch: React.Dispatch<Actions>) => {
    // Body will be added when "Configure Profile" task will be picked up
};
