import { ENS_PROFILE_BASE_URL } from '../../utils/common-utils';
import { Actions, RightViewStateType } from '../../utils/enum-type-utils';

export const onClose = (dispatch: React.Dispatch<Actions>) => {
    dispatch({
        type: RightViewStateType.ShowProfile,
        payload: false,
    });
    dispatch({
        type: RightViewStateType.ShowDefaultChat,
        payload: true,
    });
};

export const openEnsProfile = (ensName: string) => {
    window.open(ENS_PROFILE_BASE_URL + ensName, '_blank');
};

export const openProfileConfigureBox = (dispatch: React.Dispatch<Actions>) => {
    dispatch({
        type: RightViewStateType.ShowProfileConfigPopup,
        payload: true,
    });
};
