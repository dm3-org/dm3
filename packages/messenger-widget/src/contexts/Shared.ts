import {
    GlobalState,
    LeftViewSelected,
    MessageActionType,
    RightViewSelected,
} from '../utils/enum-type-utils';

export const initialState: GlobalState = {
    connection: {
        defaultServiceUrl: process.env.REACT_APP_BACKEND as string,
    },

    userDb: undefined,
    uiState: {
        lastMessagePull: 0,
        proflieExists: false,
        browserStorageBackup: false,
    },
    uiView: {
        selectedLeftView: LeftViewSelected.Contacts,
        selectedRightView: RightViewSelected.Default,
        selectedMessageView: {
            messageData: undefined,
            actionType: MessageActionType.NONE,
        },
    },
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
