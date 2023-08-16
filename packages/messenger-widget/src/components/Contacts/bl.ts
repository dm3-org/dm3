import { normalizeEnsName, getAccountDisplayName } from 'dm3-lib-profile';
import { UserDB, getConversation } from 'dm3-lib-storage';
import { ContactPreview } from '../../interfaces/utils';
import {
    AccountsType,
    Actions,
    CacheType,
    GlobalState,
    ModalStateType,
    RightViewSelected,
    UiViewStateType,
} from '../../utils/enum-type-utils';
import { Contact } from '../../interfaces/context';
import { getAvatarProfilePic } from '../../utils/ens-utils';
import { closeLoader, startLoader } from '../Loader/Loader';

export const onContactSelected = (
    state: GlobalState,
    dispatch: React.Dispatch<Actions>,
    contact: Contact,
) => {
    // set selected contact
    dispatch({
        type: AccountsType.SetSelectedContact,
        payload: contact,
    });

    if (state.uiView.selectedRightView !== RightViewSelected.Chat) {
        // show chat screen
        dispatch({
            type: UiViewStateType.SetSelectedRightView,
            payload: RightViewSelected.Chat,
        });
    }
};

// sets height of the left view according to content
export const setContactHeightToMaximum = (isProfileConfigured: boolean) => {
    const element = document.getElementsByClassName(
        'contacts-scroller',
    )[0] as HTMLElement;
    element.style.height = isProfileConfigured ? '73vh' : '57vh';
};

// fetches contact list and sets data according to view on UI
export const fetchAndSetContacts = async (
    state: GlobalState,
): Promise<ContactPreview[]> => {
    const actualContactList: ContactPreview[] = [];

    // fetch contacts list
    const contactList = state.accounts.contacts
        ? state.accounts.contacts.filter(
              (contact) =>
                  !state.userDb?.hiddenContacts.find(
                      (hiddenContact) =>
                          normalizeEnsName(hiddenContact.ensName) ===
                          normalizeEnsName(contact.account.ensName),
                  ),
          )
        : [];

    if (contactList.length) {
        // iterate each record and set data fetched from provider
        for (const contact of contactList) {
            actualContactList.push({
                name: getAccountDisplayName(contact.account.ensName, 25),
                message: getMessagesFromUser(
                    contact.account.ensName,
                    state.userDb as UserDB,
                    contactList,
                ),
                image: await getAvatarProfilePic(
                    state,
                    contact.account.ensName,
                ),
                contactDetails: contact,
            });
        }
    }

    return actualContactList;
};

export const getMessagesFromUser = (
    ensName: string,
    userDB: UserDB,
    contacts: Contact[],
): string | null => {
    const messages = getConversation(
        ensName,
        contacts.map((contact) => contact.account),
        userDB,
    );

    if (messages.length) {
        const value = messages[messages.length - 1].envelop.message.message;
        return value ? value : null;
    }

    return null;
};

export const setContactIndexSelectedFromCache = (
    state: GlobalState,
    dispatch: React.Dispatch<Actions>,
    cacheContacts: ContactPreview[],
): number | null => {
    // start loader
    dispatch({
        type: ModalStateType.LoaderContent,
        payload: 'Fetching contacts...',
    });
    startLoader();

    const key =
        state.accounts.selectedContact?.account.profile?.publicEncryptionKey;
    const name = state.accounts.selectedContact?.account.ensName;

    const index = cacheContacts.findIndex(
        (data) =>
            (key &&
                data.contactDetails.account.profile?.publicEncryptionKey ===
                    key) ||
            name === data.contactDetails.account.ensName,
    );

    // close the loader
    closeLoader();

    return index > -1 ? index : null;
};

// fetches and sets contact
export const setContactList = async (
    state: GlobalState,
    dispatch: React.Dispatch<Actions>,
    setListOfContacts: Function,
) => {
    const cacheList = state.cache.contacts;
    if (cacheList && cacheList.length) {
        setListOfContacts(cacheList);
    } else {
        const data: ContactPreview[] = await fetchAndSetContacts(state);
        dispatch({
            type: CacheType.Contacts,
            payload: data,
        });
        setListOfContacts(data);
    }
};

export const updateSelectedContact = (
    state: GlobalState,
    dispatch: React.Dispatch<Actions>,
    setContactFromList: Function,
) => {
    if (state.cache.contacts) {
        const index = state.cache.contacts?.length - 1;
        dispatch({
            type: AccountsType.SetSelectedContact,
            payload: state.cache.contacts[index].contactDetails,
        });
        setContactFromList(index);
        const stateData = state.modal.addConversation;
        stateData.processed = true;
        dispatch({
            type: ModalStateType.AddConversationData,
            payload: stateData,
        });
    }
};

// updates contact list on account change when new contact is added
export const updateContactOnAccountChange = async (
    state: GlobalState,
    dispatch: React.Dispatch<Actions>,
    contacts: ContactPreview[],
    setListOfContacts: Function,
) => {
    if (state.accounts.contacts) {
        // filter out the new conversation added
        const itemList = state.accounts.contacts.filter(
            (data) =>
                data.account.ensName === state.modal.addConversation.ensName,
        );

        if (itemList.length && state.cache.contacts) {
            // fetch last added contact
            const lastIndex = state.cache.contacts.length - 1;
            const items = [...state.cache.contacts];
            const item = { ...items[lastIndex] };

            // update the contact details
            item.contactDetails = itemList[0];
            item.message = getMessagesFromUser(
                state.modal.addConversation.ensName as string,
                state.userDb as UserDB,
                state.accounts.contacts,
            );
            item.image = await getAvatarProfilePic(
                state,
                state.modal.addConversation.ensName as string,
            );
            items[lastIndex] = item;

            // update cached contact list
            dispatch({
                type: CacheType.Contacts,
                payload: items,
            });

            // update the current contact list
            const newList = [...contacts];
            newList[lastIndex] = item;
            setListOfContacts(newList);

            // update the modal data as conversation is added
            const stateData = state.modal.addConversation;
            stateData.active = false;
            stateData.processed = false;
            dispatch({
                type: ModalStateType.AddConversationData,
                payload: stateData,
            });
        }
    }
};
