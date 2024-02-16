import { StorageLocation } from '@dm3-org/dm3-lib-storage';
import {
    ConnectionState,
    GlobalState,
    LeftViewSelected,
    MessageActionType,
    RightViewSelected,
} from '../utils/enum-type-utils';
import { ethers } from 'ethers';

export const initialState: GlobalState = {
    connection: {
        defaultServiceUrl: process.env.REACT_APP_BACKEND as string,
    },

    cache: {
        abis: new Map<string, string>(),
        contacts: null,
        lastConversation: {
            account: null,
            message: null,
        },
        messageSizeLimit: 0,
        accountName: '',
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
