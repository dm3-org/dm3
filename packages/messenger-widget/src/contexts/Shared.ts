import { StorageLocation } from 'dm3-lib-storage';
import {
    ConnectionState,
    GlobalState,
    LeftViewSelected,
    MessageActionType,
    RightViewSelected,
} from '../utils/enum-type-utils';
import { ethers } from 'ethers';

//Move to utils and get url from ENV
const getMainnetProvider = () => {
    const url = process.env.REACT_APP_MAINNET_PROVIDER_RPC;
    if (!url) {
        throw new Error('Mainnet provider not set in env');
    }
    return new ethers.providers.JsonRpcProvider(url, {
        name: 'goerli',
        chainId: 5,
    });
};

export const initialState: GlobalState = {
    connection: {
        defaultServiceUrl: process.env.REACT_APP_BACKEND as string,
    },
    accounts: {
        contacts: undefined,
        selectedContact: undefined,
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
    auth: {
        currentSession: undefined,
        recentlyUsedSession: undefined,
        allSessions: {},
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
    },
};
