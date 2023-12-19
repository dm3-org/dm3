import {
    normalizeEnsName,
    getAccountDisplayName,
    getUserProfile,
    Account,
    getDeliveryServiceProfile,
} from 'dm3-lib-profile';
import { UserDB, getConversation } from 'dm3-lib-storage';
import { ContactPreview } from '../../interfaces/utils';
import {
    AccountsType,
    Actions,
    CacheType,
    GlobalState,
    MessageActionType,
    ModalStateType,
    RightViewSelected,
    UiViewStateType,
} from '../../utils/enum-type-utils';
import { Contact } from '../../interfaces/context';
import { getAvatarProfilePic } from '../../utils/ens-utils';
import { closeLoader, startLoader } from '../Loader/Loader';
import { ethers } from 'ethers';
import { getDeliveryServiceProperties } from 'dm3-lib-delivery-api';
import { MessageState } from 'dm3-lib-messaging';
import axios from 'axios';
import { globalConfig } from 'dm3-lib-shared';
import { mainnet } from 'wagmi';
import e from 'cors';

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
    element.style.height = isProfileConfigured ? '88.5vh' : '88.5vh';
};

// fetches contact list and sets data according to view on UI
export const fetchAndSetContacts = async (
    state: GlobalState,
    mainnetProvider: ethers.providers.StaticJsonRpcProvider,
): Promise<ContactPreview[]> => {
    const actualContactList: ContactPreview[] = [];

    if (state.accounts.contacts) {
        // iterate each record and set data fetched from provider
        for (const contact of state.accounts.contacts) {
            actualContactList.push({
                name: getAccountDisplayName(contact.account.ensName, 25),
                message: getMessagesFromUser(
                    contact.account.ensName,
                    state.userDb as UserDB,
                    state.accounts.contacts,
                ),
                image: await getAvatarProfilePic(
                    mainnetProvider,
                    contact.account.ensName,
                ),
                unreadMsgCount: fetchUnreadMessagesCount(
                    state,
                    contact.account.ensName,
                ),
                contactDetails: contact,
                isHidden: state.userDb?.hiddenContacts.find(
                    (hiddenContact) =>
                        normalizeEnsName(hiddenContact.ensName) ===
                        normalizeEnsName(contact.account.ensName),
                )
                    ? true
                    : false,
            });
        }
    }

    const uniqueContacts = filterOutDuplicateContacts(actualContactList);

    return uniqueContacts;
};

const filterOutDuplicateContacts = (contactList: ContactPreview[]) => {
    const result: ContactPreview[] = [];

    // contact with profile
    const contactsWithProfile = contactList.filter(
        (data: ContactPreview) => data.contactDetails.account.profileSignature,
    );

    // contacts without profile
    const contactsWithOutProfile = contactList.filter(
        (data: ContactPreview) => !data.contactDetails.account.profileSignature,
    );

    // fetch unique profiles
    const uniqueProfiles = [
        ...new Set(
            contactsWithProfile.map(
                (item) => item.contactDetails.account.profileSignature,
            ),
        ),
    ];

    // filter out the profile signatures with ensName
    uniqueProfiles.map((profile) => {
        // fetch all contacts with same profile
        const records = contactsWithProfile.filter(
            (data) => data.contactDetails.account.profileSignature === profile,
        );
        if (records.length > 1) {
            // fetch profile with eth as ens name
            const ensNames = records.filter((item) => {
                const ensName = item.contactDetails.account.ensName.split('.');
                if (ensName.length === 2 && ensName[1] === 'eth') {
                    return true;
                }
            });
            if (ensNames.length) {
                result.push(ensNames[0]);
            } else {
                // fetch profile with .user.dm3.eth as ens name
                const userEnsDomains = records.filter((item) =>
                    item.contactDetails.account.ensName.endsWith(
                        globalConfig.USER_ENS_SUBDOMAIN(),
                    ),
                );
                if (userEnsDomains.length) {
                    result.push(userEnsDomains[0]);
                } else {
                    // fetch profile with .addr.dm3.eth as ens name
                    const addrEnsDomains = records.filter((item) =>
                        item.contactDetails.account.ensName.endsWith(
                            globalConfig.ADDR_ENS_SUBDOMAIN(),
                        ),
                    );
                    if (addrEnsDomains.length) {
                        result.push(addrEnsDomains[0]);
                    } else {
                        result.push(records[0]);
                    }
                }
            }
        } else {
            result.push(records[0]);
        }
    });

    return [...result, ...contactsWithOutProfile];
};

export const getMessagesFromUser = (
    ensName: string,
    userDB: UserDB,
    contacts: Contact[],
): string | null => {
    try {
        const messages = getConversation(
            ensName,
            contacts.map((contact) => contact.account),
            userDB,
        );

        if (messages.length) {
            const value = messages[messages.length - 1].envelop.message.message;
            return value &&
                messages[messages.length - 1].envelop.message.metadata.type !==
                    MessageActionType.DELETE
                ? value
                : null;
        }

        return null;
    } catch (error) {
        return null;
    }
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
                data.contactDetails &&
                data.contactDetails.account.profile?.publicEncryptionKey ===
                    key) ||
            (data.contactDetails &&
                name === data.contactDetails.account.ensName),
    );

    // close the loader
    closeLoader();

    return index > -1 ? index : null;
};

export const addNewConversationFound = async (
    state: GlobalState,
    mainnetProvider: ethers.providers.StaticJsonRpcProvider,
    dispatch: React.Dispatch<Actions>,
    setListOfContacts: Function,
) => {
    if (state.accounts.contacts && state.cache.contacts) {
        const existingList: ContactPreview[] = state.cache.contacts;
        // fetch contacts from list that are new
        const contactList: Contact[] = [];
        state.accounts.contacts.forEach((contact) => {
            const data = existingList.filter(
                (cacheContact) =>
                    cacheContact.contactDetails &&
                    cacheContact.contactDetails.account.ensName ===
                        contact.account.ensName,
            );
            if (!data || !data.length) {
                contactList.push(contact);
            }
        });

        // filter the contacts that are not hidden
        const filteredContactList = contactList
            ? contactList.filter(
                  (contact) =>
                      !state.userDb?.hiddenContacts.find(
                          (hiddenContact) =>
                              normalizeEnsName(hiddenContact.ensName) ===
                              normalizeEnsName(contact.account.ensName),
                      ),
              )
            : [];

        const actualContactList: ContactPreview[] = [];

        if (filteredContactList.length) {
            for (const contact of filteredContactList) {
                actualContactList.push({
                    name: getAccountDisplayName(contact.account.ensName, 25),
                    message: getMessagesFromUser(
                        contact.account.ensName,
                        state.userDb as UserDB,
                        state.accounts.contacts,
                    ),
                    image: await getAvatarProfilePic(
                        mainnetProvider,
                        contact.account.ensName,
                    ),
                    unreadMsgCount: fetchUnreadMessagesCount(
                        state,
                        contact.account.ensName,
                    ),
                    contactDetails: contact,
                    isHidden: state.userDb?.hiddenContacts.find(
                        (hiddenContact) =>
                            normalizeEnsName(hiddenContact.ensName) ===
                            normalizeEnsName(contact.account.ensName),
                    )
                        ? true
                        : false,
                });
            }

            if (state.cache.contacts) {
                const newContactList = [
                    ...state.cache.contacts,
                    ...actualContactList,
                ];
                dispatch({
                    type: CacheType.Contacts,
                    payload: newContactList,
                });
                setListOfContacts(newContactList);
            }
        }
    }
};

// fetches and sets contact
export const setContactList = async (
    state: GlobalState,
    mainnetProvider: ethers.providers.StaticJsonRpcProvider,
    dispatch: React.Dispatch<Actions>,
    setListOfContacts: Function,
) => {
    const cacheList = state.cache.contacts;
    if (cacheList && cacheList.length) {
        if (
            state.accounts.contacts &&
            cacheList.length !== state.accounts.contacts.length
        ) {
            await addNewConversationFound(
                state,
                mainnetProvider,
                dispatch,
                setListOfContacts,
            );
        } else {
            setListOfContacts(cacheList);
        }
    } else {
        const data: ContactPreview[] = await fetchAndSetContacts(
            state,
            mainnetProvider,
        );
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

const fetchesUserProfile = async (
    mainnetProvider: ethers.providers.StaticJsonRpcProvider,
    ensName: string,
) => {
    try {
        return await getUserProfile(mainnetProvider!, ensName);
    } catch (error) {
        return null;
    }
};

// updates contact list on account change when new contact is added
export const updateContactOnAccountChange = async (
    state: GlobalState,
    mainnetProvider: ethers.providers.StaticJsonRpcProvider,
    dispatch: React.Dispatch<Actions>,
    contacts: ContactPreview[],
    setListOfContacts: Function,
    setContactFromList: Function,
) => {
    try {
        if (state.accounts.contacts) {
            // filter out the new conversation added
            const itemList = state.accounts.contacts.filter(
                (data) =>
                    data.account.ensName ===
                    state.modal.addConversation.ensName,
            );

            if (state.cache.contacts) {
                // fetch last added contact
                const lastIndex = state.cache.contacts.length - 1;
                const items = [...state.cache.contacts];
                const item = { ...items[lastIndex] };

                const profile = await fetchesUserProfile(
                    mainnetProvider!,
                    state.modal.addConversation.ensName as string,
                );

                const profileDetails = await Promise.all(
                    state.cache.contacts.map(async (data, index) => {
                        return {
                            ensName: data.contactDetails.account.ensName,
                            sign: await fetchesUserProfile(
                                mainnetProvider!,
                                data.contactDetails.account.ensName,
                            ),
                            index: index,
                        };
                    }),
                );

                const duplicateContact = profileDetails.filter(
                    (data: any) =>
                        data.sign &&
                        profile &&
                        data.sign.signature === profile.signature,
                );

                // checks duplicate contact based on profile signature
                if (duplicateContact.length > 1) {
                    const address = duplicateContact[1].ensName.split('.')[0];
                    // if the newly contact added is ENS name
                    if (
                        address &&
                        duplicateContact[1].ensName &&
                        !ethers.utils.isAddress(address)
                    ) {
                        const newList = [...contacts];
                        const existingRecord =
                            newList[duplicateContact[0].index];
                        const newRecord = newList[duplicateContact[1].index];

                        // update details from existing contacts
                        newRecord.contactDetails = newRecord.contactDetails;
                        newRecord.contactDetails.deliveryServiceProfile =
                            existingRecord.contactDetails.deliveryServiceProfile;

                        if (profile) {
                            newRecord.contactDetails.account.profile =
                                profile.profile;
                        }
                        newRecord.message = getMessagesFromUser(
                            existingRecord.contactDetails.account
                                .ensName as string,
                            state.userDb as UserDB,
                            state.accounts.contacts,
                        );
                        newRecord.image = await getAvatarProfilePic(
                            mainnetProvider,
                            newRecord.contactDetails.account.ensName as string,
                        );

                        existingRecord.isHidden = true;

                        // remove already selected item
                        newList[duplicateContact[0].index] = existingRecord;
                        newList[duplicateContact[1].index] = newRecord;

                        // update contact list
                        setListOfContacts(newList);

                        // update cached contact list
                        dispatch({
                            type: CacheType.Contacts,
                            payload: newList,
                        });
                    } else {
                        // if the newly contact added is address
                        const newList = [...contacts];

                        let updatedList: ContactPreview[] = [];

                        if (newList.length) {
                            updatedList = newList;
                        } else {
                            const oldList = [...state.cache.contacts];
                            updatedList = oldList;
                        }

                        const newItem = updatedList[updatedList.length - 1];
                        newItem.isHidden = true;

                        updatedList[updatedList.length - 1] = newItem;

                        // update contact list
                        setListOfContacts(updatedList);

                        // update cached contact list
                        dispatch({
                            type: CacheType.Contacts,
                            payload: updatedList,
                        });

                        // select the already existing contact
                        setContactFromList(duplicateContact[0].index);

                        dispatch({
                            type: AccountsType.SetSelectedContact,
                            payload:
                                updatedList[duplicateContact[0].index]
                                    .contactDetails,
                        });
                    }
                } else {
                    let contactToAdd;

                    if (profile?.profile) {
                        const deliveryServiceProfile =
                            await getDeliveryServiceProfile(
                                profile.profile.deliveryServices[0],
                                mainnetProvider!,
                                async (url: string) =>
                                    (
                                        await axios.get(url)
                                    ).data,
                            );

                        contactToAdd = {
                            account: {
                                ensName: state.modal.addConversation
                                    .ensName as string,
                                profile: {
                                    publicEncryptionKey:
                                        profile.profile.publicEncryptionKey,
                                    publicSigningKey:
                                        profile.profile.publicSigningKey,
                                    deliveryServices:
                                        profile.profile.deliveryServices,
                                },
                                profileSignature: profile.signature,
                            },
                            deliveryServiceProfile: deliveryServiceProfile,
                        };
                    } else {
                        contactToAdd = itemList[0];
                    }

                    if (!contactToAdd) {
                        contactToAdd = {
                            account: {
                                ensName: state.modal.addConversation
                                    .ensName as string,
                                profile: undefined,
                                profileSignature: undefined,
                            },
                            deliveryServiceProfile: undefined,
                        };
                    }

                    // update the contact details
                    item.contactDetails = contactToAdd;

                    if (profile) {
                        item.contactDetails.account.profile = profile.profile;
                    }

                    item.message = getMessagesFromUser(
                        state.modal.addConversation.ensName as string,
                        state.userDb as UserDB,
                        state.accounts.contacts,
                    );

                    item.image = await getAvatarProfilePic(
                        mainnetProvider,
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

                    dispatch({
                        type: AccountsType.SetSelectedContact,
                        payload: item.contactDetails,
                    });
                }

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
    } catch (error) {}
};

// reset's the contact list on hiding any contact
export const resetContactListOnHide = (
    state: GlobalState,
    dispatch: React.Dispatch<Actions>,
    setListOfContacts: Function,
) => {
    if (state.modal.contactToHide) {
        const cachedContactList = state.cache.contacts?.filter(
            (data) =>
                data.contactDetails.account.ensName !==
                state.modal.contactToHide,
        );

        dispatch({
            type: CacheType.Contacts,
            payload: cachedContactList as [],
        });

        setListOfContacts(cachedContactList);

        dispatch({
            type: ModalStateType.ContactToHide,
            payload: undefined,
        });
    }
};

export const showMenuInBottom = (index: number | null): boolean => {
    const scroller: HTMLElement = document.getElementById(
        'chat-scroller',
    ) as HTMLElement;
    if (index != null && scroller) {
        const contact: HTMLElement = document.getElementById(
            `chat-item-id-${index}`,
        ) as HTMLElement;
        if (contact) {
            const scrollerBottom: number =
                scroller.getBoundingClientRect().bottom;
            const contactBottom: number =
                contact.getBoundingClientRect().bottom;
            return scrollerBottom - contactBottom >= 156 ? true : false;
        }
    }
    return true;
};

export const fetchMessageSizeLimit = async (
    mainnetProvider: ethers.providers.StaticJsonRpcProvider,
    account: Account,
    dispatch: React.Dispatch<Actions>,
) => {
    const details = await getDeliveryServiceProperties(
        mainnetProvider as ethers.providers.JsonRpcProvider,
        account as Account,
    );
    dispatch({
        type: CacheType.MessageSizeLimit,
        payload: details.sizeLimit,
    });
};

export const fetchUnreadMessagesCount = (
    state: GlobalState,
    ensName: string,
) => {
    try {
        const messages = getConversation(
            ensName,
            state.accounts.contacts
                ? state.accounts.contacts.map((contact) => contact.account)
                : [],
            state.userDb as UserDB,
        );
        return messages.filter(
            (container) => container.messageState === MessageState.Send,
        ).length;
    } catch (error) {
        return 0;
    }
};

export const updateUnreadMsgCount = (
    state: GlobalState,
    dispatch: React.Dispatch<Actions>,
    contactSelected: number | null,
) => {
    if (state.cache.contacts && contactSelected !== null) {
        const items = [...state.cache.contacts];
        const item = {
            ...items[contactSelected],
            unreadMsgCount: 0,
        };
        items[contactSelected] = item;
        dispatch({
            type: CacheType.Contacts,
            payload: items,
        });
    }
};

export const fetchAndUpdateUnreadMsgCount = (
    state: GlobalState,
    dispatch: React.Dispatch<Actions>,
) => {
    if (state.cache.contacts && state.accounts.contacts) {
        const items = [...state.cache.contacts];
        items.forEach((data, index) => {
            items[index].unreadMsgCount = fetchUnreadMessagesCount(
                state,
                data.contactDetails.account.ensName,
            );
            items[index].message = getMessagesFromUser(
                data.contactDetails.account.ensName,
                state.userDb as UserDB,
                state.accounts.contacts as Contact[],
            );
        });
        dispatch({
            type: CacheType.Contacts,
            payload: items,
        });
    }
};
