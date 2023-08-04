import { normalizeEnsName, getAccountDisplayName } from 'dm3-lib-profile';
import { UserDB, getConversation } from 'dm3-lib-storage';
import { ContactPreview } from '../../interfaces/utils';
import {
    AccountInfo,
    AccountsType,
    Actions,
    GlobalState,
    RightViewSelected,
    UiViewStateType,
} from '../../utils/enum-type-utils';
import { Contact } from '../../interfaces/context';
import { getAvatarProfilePic } from '../../utils/ens-utils';

// Updates the style of particular contact item on hover
export function MouseOver(
    event: React.MouseEvent,
    className: string,
    index: number,
    selectedContactIndex: number | null,
    closeContactMenu: Function
) {
    // highlight background only if contact is not selected
    if (selectedContactIndex !== index) {
        event.currentTarget.classList.add(className);
        event.currentTarget.classList.add('contact-details-container-hover');
        // close the contact menu option 
        closeContactMenu();
    }
    // show three dots icon only when contact is selected and remove hover class
    if (selectedContactIndex === index) {
        const actionItem: any = document.getElementById('contact-' + index);
        event.currentTarget.classList.remove('contact-details-container-hover');
        actionItem.style.display = 'block';
    }
}

// Updates the style of particular contact item on hover removal
export function MouseOut(
    event: React.MouseEvent,
    className: string,
    index: number
) {
    event.currentTarget.classList.remove(className);
    const actionItem: any = document.getElementById('contact-' + index);
    actionItem.style.display = 'none';
}

// updates the style of sticky to top and bottom
export const updateStickyStyleOnSelect = (index: number) => {
    // fetch element to be marked as sticky
    const item: HTMLElement = document.getElementById(
        'contact-container-' + index,
    ) as HTMLElement;

    // remove sticky css from last selected contact
    const allElements = document.querySelectorAll('*');
    allElements.forEach((element) => {
        element.classList.remove('sticky-on-selected-contact');
    });

    // add sticky css
    item.classList.add('sticky-on-selected-contact');
};

// Updates the style of particular contact item on click
export const onContactSelected = (
    event: any,
    index: number,
    classOne: string,
    classTwo: string,
    dispatch: React.Dispatch<Actions>,
    contact: Contact
) => {

    // remove normal hover css
    event.currentTarget.classList.remove(classOne);

    // remove highlighted css
    event.currentTarget.classList.remove('contact-details-container-hover');

    // remove click css from entire list
    const allElements = document.querySelectorAll('*');
    allElements.forEach((element) => {
        element.classList.remove(classOne);
        element.classList.remove(classTwo);
        element.classList.remove('contact-hover-effect');
    });

    // add click css
    event.currentTarget.classList.add(classTwo);
    const actionItem: any = document.getElementById('contact-' + index);
    // actionItem.style.display = 'none';
    actionItem.classList.add('contact-hover-effect');

    // show chat screen
    dispatch({
        type: UiViewStateType.SetSelectedRightView,
        payload: RightViewSelected.Chat,
    });

    // set selected contact
    dispatch({
        type: AccountsType.SetSelectedContact,
        payload: contact,
    });

    // set account info to none
    dispatch({
        type: AccountsType.SetAccountInfoView,
        payload: AccountInfo.None,
    });
};

// removes active contact style
export const removedSelectedContact = (index: number) => {
    const item: HTMLElement = document.getElementById(
        'contact-container-' + index,
    ) as HTMLElement;
    item.classList.remove('sticky-on-selected-contact');
    const innerItem = item.firstChild as HTMLElement;
    innerItem.classList.remove('background-active-contact');
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
    let actualContactList: ContactPreview[] = [];

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
        for (let index = 0; index < contactList.length; index++) {
            actualContactList.push({
                name: getAccountDisplayName(
                    contactList[index].account.ensName,
                    25,
                ),
                message: getMessagesFromUser(
                    contactList[index].account.ensName,
                    state.userDb as UserDB,
                    contactList,
                ),
                image: await getAvatarProfilePic(
                    state,
                    contactList[index].account.ensName,
                ),
                contactDetails: contactList[index],
            });
        }
    }

    return actualContactList;
};

const getMessagesFromUser = (
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

export const setContactSelectedFromCache = (
    state: GlobalState,
    cacheContacts: ContactPreview[],
): number | null => {
    const key = state.accounts.selectedContact?.account.profile?.publicEncryptionKey;
    for (let index = 0; index < cacheContacts.length; index++) {
        if (cacheContacts[index].contactDetails.account.profile?.publicEncryptionKey === key) {
            return index;
        }
    }
    return null;
};