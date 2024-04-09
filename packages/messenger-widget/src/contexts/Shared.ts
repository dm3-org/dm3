import {
    GlobalState,
    LeftViewSelected,
    MessageActionType,
    RightViewSelected,
} from '../utils/enum-type-utils';

export const initialState = (): GlobalState => {
    return {
        // uiView: {
        //     selectedLeftView: LeftViewSelected.Contacts,
        //     selectedRightView: RightViewSelected.Default,
        //     selectedMessageView: {
        //         messageData: undefined,
        //         actionType: MessageActionType.NONE,
        //     },
        // },
        modal: {
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
        },
    };
};
