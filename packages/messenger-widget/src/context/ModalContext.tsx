import React from 'react';
import { NewContact } from '../interfaces/utils';
import { MessageActionType } from '../utils/enum-type-utils';
import { IOpenEmojiPopup, useModal } from '../hooks/modals/useModal';

export type ModalContextType = {
    loaderContent: string;
    setLoaderContent: (content: string) => void;
    contactToHide: string | undefined;
    setContactToHide: (action: string | undefined) => void;
    addConversation: NewContact;
    setAddConversation: (contact: NewContact) => void;
    openEmojiPopup: IOpenEmojiPopup;
    setOpenEmojiPopup: (action: IOpenEmojiPopup) => void;
    lastMessageAction: MessageActionType;
    setLastMessageAction: (action: MessageActionType) => void;
    showProfileConfigurationModal: boolean;
    setShowProfileConfigurationModal: (show: boolean) => void;
    showPreferencesModal: boolean;
    setShowPreferencesModal: (show: boolean) => void;
    resetModalStates: () => void;
};

export const ModalContext = React.createContext<ModalContextType>({
    loaderContent: '',
    setLoaderContent: (content: string) => {},
    contactToHide: undefined,
    setContactToHide: (action: string | undefined) => {},
    addConversation: {
        active: false,
        ensName: undefined,
        processed: false,
    },
    setAddConversation: (contact: NewContact) => {},
    openEmojiPopup: { action: false, data: undefined },
    setOpenEmojiPopup: (action: IOpenEmojiPopup) => {},
    lastMessageAction: MessageActionType.NONE,
    setLastMessageAction: (action: MessageActionType) => {},
    showProfileConfigurationModal: false,
    setShowProfileConfigurationModal: (show: boolean) => {},
    showPreferencesModal: false,
    setShowPreferencesModal: (show: boolean) => {},
    resetModalStates: () => {},
});

export const ModalContextProvider = ({ children }: { children?: any }) => {
    const {
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
        resetModalStates,
    } = useModal();

    return (
        <ModalContext.Provider
            value={{
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
                resetModalStates,
            }}
        >
            {children}
        </ModalContext.Provider>
    );
};
