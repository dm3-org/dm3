import { ethers } from 'ethers';
import {
    AccountsType,
    Actions,
    CacheType,
    GlobalState,
    LeftViewSelected,
    ModalStateType,
    RightViewSelected,
    UiViewStateType,
    UserDbType,
} from '../../utils/enum-type-utils';
import {
    formatAddress,
    getAccountDisplayName,
    normalizeEnsName,
} from 'dm3-lib-profile';
import { closeLoader, startLoader } from '../Loader/Loader';
import { ContactPreview, NewContact } from '../../interfaces/utils';
import humanIcon from '../../assets/images/human.svg';

// class for input field
export const INPUT_FIELD_CLASS =
    'conversation-name font-weight-400 font-size-14 border-radius-6 w-100 line-height-24';

// method to open the conversation modal
export const openConversationModal = () => {
    const modal: HTMLElement = document.getElementById(
        'conversation-modal',
    ) as HTMLElement;
    modal.style.display = 'block';
};

// method to close the add conversation modal
export const closeConversationModal = (
    resetName: Function,
    showErrorMessage: Function,
    resetInputFieldClass: Function,
) => {
    const modal: HTMLElement = document.getElementById(
        'conversation-modal',
    ) as HTMLElement;
    modal.style.display = 'none';
    showErrorMessage(false, '');
    resetName();
    resetInputFieldClass();
};

// method to add new conversation in contacts
export const addContact = async (
    name: string,
    state: GlobalState,
    dispatch: React.Dispatch<Actions>,
    resetName: Function,
    showErrorMessage: Function,
    resetInputFieldClass: Function,
) => {
    // start loader
    dispatch({
        type: ModalStateType.LoaderContent,
        payload: 'Adding contact...',
    });

    startLoader();

    // check if its a valid address or a valid name
    const { normalizedAccountName, check } = await isEnsNameValid(name, state);

    if (
        state.connection.ethAddress &&
        name.split('.')[0] &&
        state.connection.ethAddress.toLowerCase() ===
            name.split('.')[0].toLowerCase()
    ) {
        showErrorMessage(true, 'Invalid ENS name');
        closeLoader();
        return;
    }

    if (!check) {
        showErrorMessage(true, 'Invalid ENS name');
        closeLoader();
        return;
    }

    // check if contact exists in hidden contact
    const hiddenContact = state.userDb?.hiddenContacts.find(
        (contact) =>
            normalizeEnsName(contact.ensName) === normalizedAccountName,
    );

    // unhide contact
    if (hiddenContact && state.accounts.contacts) {
        // update hidden contact
        updateHiddenContact(
            state,
            dispatch,
            normalizedAccountName,
            hiddenContact.aka,
        );

        // update states
        updateStates(
            state,
            dispatch,
            resetName,
            showErrorMessage,
            resetInputFieldClass,
            normalizedAccountName,
        );
    } else {
        // check if contact already exists else create new conversation
        const doesExists = state.userDb?.conversations.has(
            normalizedAccountName,
        );

        if (doesExists) {
            showErrorMessage(true, 'Contact already exists');
            closeLoader();
            return;
        } else {
            // update states
            updateStates(
                state,
                dispatch,
                resetName,
                showErrorMessage,
                resetInputFieldClass,
                normalizedAccountName,
            );

            // create empty conversation
            dispatch({
                type: UserDbType.createEmptyConversation,
                payload: normalizedAccountName,
            });
        }
    }
};

// updates states and closes modal
const updateStates = (
    state: GlobalState,
    dispatch: React.Dispatch<Actions>,
    resetName: Function,
    showErrorMessage: Function,
    resetInputFieldClass: Function,
    normalizedAccountName: string,
) => {
    // remove selected contact
    dispatch({
        type: AccountsType.SetSelectedContact,
        payload: undefined,
    });

    // add new contact item in the list
    const newContact: ContactPreview = {
        name: getAccountDisplayName(normalizedAccountName, 25),
        message: null,
        image: humanIcon,
        contactDetails: {
            account: {
                ensName: normalizedAccountName,
                profile: undefined,
                profileSignature: undefined,
            },
            deliveryServiceProfile: undefined,
        },
    };

    // add new contact in cached contact list
    dispatch({
        type: CacheType.Contacts,
        payload: state.cache.contacts
            ? [...state.cache.contacts, newContact]
            : [newContact],
    });

    // close the modal
    closeConversationModal(resetName, showErrorMessage, resetInputFieldClass);

    const addConversationData: NewContact = {
        active: true,
        ensName: normalizedAccountName,
        processed: false,
    };

    // set new contact data
    dispatch({
        type: ModalStateType.AddConversationData,
        payload: addConversationData,
    });

    // set left view to contacts
    dispatch({
        type: UiViewStateType.SetSelectedLeftView,
        payload: LeftViewSelected.Contacts,
    });

    // set right view to chat
    dispatch({
        type: UiViewStateType.SetSelectedRightView,
        payload: RightViewSelected.Chat,
    });
};

// updates hidden contact states
const updateHiddenContact = (
    state: GlobalState,
    dispatch: React.Dispatch<Actions>,
    normalizedAccountName: string,
    aka: string | undefined,
) => {
    if (!aka) {
        // unhide the contact
        dispatch({
            type: UserDbType.unhideContact,
            payload: normalizedAccountName,
        });
    } else {
        // set contact selected
        dispatch({
            type: AccountsType.SetSelectedContact,
            payload: state.accounts.contacts?.find(
                (contact) => contact.account.ensName === aka,
            ),
        });
    }
};

// check ENS name is valid or not
const isEnsNameValid = async (name: string, state: GlobalState) => {
    let normalizedAccountName: string;

    // check if it is valid address
    if (
        ethers.utils.isAddress(name) &&
        process.env.REACT_APP_ADDR_ENS_SUBDOMAIN
    ) {
        normalizedAccountName = normalizeEnsName(
            formatAddress(name) + process.env.REACT_APP_ADDR_ENS_SUBDOMAIN,
        );
        return {
            normalizedAccountName: normalizedAccountName,
            check: true,
        };
    } else {
        // check if its is valid ENS name
        normalizedAccountName = normalizeEnsName(name);
        const resolvedName = await state.connection.provider?.resolveName(
            normalizedAccountName,
        );
        return {
            normalizedAccountName: normalizedAccountName,
            check: resolvedName ? true : false,
        };
    }
};
