import { useState } from 'react';
import { NewContact } from '../../interfaces/utils';
import { MessageProps } from '../../interfaces/props';
import {
    MessageActionType,
    ProfileScreenType,
    ProfileType,
} from '../../utils/enum-type-utils';

export interface IOpenEmojiPopup {
    action: boolean;
    data: MessageProps | undefined;
}

export interface IConfigureProfileModal {
    profileOptionSelected: ProfileType;
    onScreen: ProfileScreenType;
}

export const useModal = () => {
    const [loaderContent, setLoaderContent] = useState<string>('');

    const [contactToHide, setContactToHide] = useState<string | undefined>(
        undefined,
    );

    const [addConversation, setAddConversation] = useState<NewContact>({
        active: false,
        ensName: undefined,
        processed: false,
    });

    const [openEmojiPopup, setOpenEmojiPopup] = useState<IOpenEmojiPopup>({
        action: false,
        data: undefined,
    });

    const [lastMessageAction, setLastMessageAction] =
        useState<MessageActionType>(MessageActionType.NONE);

    const [showProfileConfigurationModal, setShowProfileConfigurationModal] =
        useState<boolean>(false);

    const [showPreferencesModal, setShowPreferencesModal] =
        useState<boolean>(false);

    const [showAddConversationModal, setShowAddConversationModal] =
        useState<boolean>(false);

    const [showAboutModal, setShowAboutModal] = useState<boolean>(false);

    const [configureProfileModal, setConfigureProfileModal] =
        useState<IConfigureProfileModal>({
            profileOptionSelected: ProfileType.DM3_NAME,
            onScreen: ProfileScreenType.NONE,
        });

    const resetConfigureProfileModal = () => {
        setConfigureProfileModal({
            profileOptionSelected: ProfileType.DM3_NAME,
            onScreen: ProfileScreenType.NONE,
        });
    };
    const resetModalStates = () => {
        setLoaderContent('');
        setContactToHide(undefined);
        setAddConversation({
            active: false,
            ensName: undefined,
            processed: false,
        });
        setOpenEmojiPopup({ action: false, data: undefined });
        setLastMessageAction(MessageActionType.NONE);
        setShowProfileConfigurationModal(false);
        setShowPreferencesModal(false);
        setShowAboutModal(false);
        setShowAddConversationModal(false);
        setConfigureProfileModal({
            profileOptionSelected: ProfileType.DM3_NAME,
            onScreen: ProfileScreenType.NONE,
        });
    };

    return {
        loaderContent,
        setLoaderContent,
        contactToHide,
        setContactToHide,
        addConversation,
        setAddConversation,
        openEmojiPopup,
        setOpenEmojiPopup,
        lastMessageAction,
        setLastMessageAction,
        showProfileConfigurationModal,
        setShowProfileConfigurationModal,
        showPreferencesModal,
        setShowPreferencesModal,
        showAboutModal,
        setShowAboutModal,
        showAddConversationModal,
        setShowAddConversationModal,
        resetModalStates,
        configureProfileModal,
        setConfigureProfileModal,
        resetConfigureProfileModal,
    };
};
