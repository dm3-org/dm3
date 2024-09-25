import { useContext, useEffect, useState } from 'react';
import { NewContact } from '../../interfaces/utils';
import { MessageProps } from '../../interfaces/props';
import {
    MessageActionType,
    ProfileScreenType,
    ProfileType,
} from '../../utils/enum-type-utils';
import {
    PREFERENCES_ITEMS,
    preferencesItems,
} from '../../components/Preferences/bl';
import { DM3ConfigurationContext } from '../../context/DM3ConfigurationContext';

export interface IOpenEmojiPopup {
    action: boolean;
    data: MessageProps | undefined;
}

export interface IConfigureProfileModal {
    profileOptionSelected: ProfileType;
    onScreen: ProfileScreenType;
}

export type PreferencesOptionType = {
    icon: JSX.Element;
    name: string;
    component: JSX.Element;
    isEnabled: boolean;
    ticker: PREFERENCES_ITEMS;
};

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

    const [preferencesOptions, setPreferencesOptions] = useState<
        PreferencesOptionType[]
    >([]);

    const [preferencesOptionSelected, setPreferencesOptionSelected] =
        useState<PreferencesOptionType | null>(null);

    const { dm3Configuration } = useContext(DM3ConfigurationContext);

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
        setPreferencesOptions(preferencesItems);
        setPreferencesOptionSelected(null);
    };

    const configureOptionsOfPreferences = () => {
        const prefState = [...preferencesItems];

        // enable or disable network dialog
        if (
            dm3Configuration.enableNetworkDialog !== undefined &&
            dm3Configuration.enableNetworkDialog !== null
        ) {
            const updatedStates = prefState.map((pref) => {
                return {
                    ...pref,
                    isEnabled:
                        pref.ticker === PREFERENCES_ITEMS.NETWORK
                            ? dm3Configuration.enableNetworkDialog
                            : pref.isEnabled,
                };
            });
            setPreferencesOptions(updatedStates as PreferencesOptionType[]);
        }
    };

    const updatePreferenceSelected = (ticker: PREFERENCES_ITEMS | null) => {
        setPreferencesOptionSelected(
            ticker
                ? preferencesOptions.find(
                      (p) => p.ticker === ticker && p.isEnabled,
                  ) ?? null
                : null,
        );
    };

    // configure dialog to show properties in preferences modal
    useEffect(() => {
        configureOptionsOfPreferences();
    }, [dm3Configuration]);

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
        preferencesOptionSelected,
        setPreferencesOptionSelected,
        preferencesOptions,
        updatePreferenceSelected,
    };
};
