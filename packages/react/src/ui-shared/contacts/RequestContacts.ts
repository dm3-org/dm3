import axios from 'axios';
import { Actions } from '../../GlobalContextProvider';
import { AccountsType } from '../../reducers/Accounts';
import { Contact, GlobalState } from '../../reducers/shared';
import { UserDbType } from '../../reducers/UserDB';
import { getContacts } from './getContacts';
import { submitMessage } from '../../../context/messageContext/submitMessage/submitMessage';
import { log, stringify } from 'dm3-lib-shared';
import {
    Account,
    getDeliveryServiceProfile,
    normalizeEnsName,
} from 'dm3-lib-profile';
import { StorageEnvelopContainer, getConversation } from 'dm3-lib-storage';
import { MessageState } from 'dm3-lib-messaging';
import { Connection } from '../../web3provider/Web3Provider';

function fetchDeliveryServiceProfile(connection: Connection) {
    return async (account: Account): Promise<Contact> => {
        const deliveryServiceUrl = account.profile?.deliveryServices[0];

        //This is most likely the case when the profile can't be fetched at all.

        if (!deliveryServiceUrl) {
            log(
                '[fetchDeliverServicePorfile] Cant resolve deliveryServiceUrl',
                'info',
            );
            return {
                account,
            };
        }

        const deliveryServiceProfile = await getDeliveryServiceProfile(
            deliveryServiceUrl,
            connection.provider!,
            async (url: string) => (await axios.get(url)).data,
        );

        return {
            account,
            deliveryServiceProfile,
        };
    };
}

export async function requestContacts(
    state: GlobalState,
    dispatch: React.Dispatch<Actions>,
    defaultContacts: string[],
) {
    const connection = state.connection;
    const deliveryServiceToken = state.auth.currentSession?.token!;
    const selectedContact = state.accounts.selectedContact;
    const setSelectedContact = (contact: Contact | undefined) =>
        dispatch({
            type: AccountsType.SetSelectedContact,
            payload: contact,
        });
    const userDb = state.userDb!;
    const createEmptyConversationEntry = (id: string) =>
        dispatch({
            type: UserDbType.createEmptyConversation,
            payload: id,
        });

    const storeMessages = (conversations: StorageEnvelopContainer[]) =>
        conversations.forEach((conversation) =>
            dispatch({
                type: UserDbType.addMessage,
                payload: {
                    container: conversation,
                    connection: state.connection,
                },
            }),
        );
    //Get the users contact list from the delivery service
    let retrievedContacts = await getContacts(
        connection,
        userDb,
        deliveryServiceToken,
        createEmptyConversationEntry,
    );

    //If there are no contacts, we need to create a conversation entry for the default contact
    await Promise.all(
        defaultContacts.map(async (defaultContact) => {
            if (
                !retrievedContacts.find(
                    (account: Account) =>
                        normalizeEnsName(account.ensName) ===
                        normalizeEnsName(defaultContact),
                )
            ) {
                createEmptyConversationEntry(defaultContact);

                //For whatever reason we're retriving all contacts again
                //TODO check if that can be omited
                retrievedContacts = await getContacts(
                    connection,
                    userDb,
                    deliveryServiceToken,
                    createEmptyConversationEntry,
                );
            }
        }),
    );
    //Fetch the delivery service profile for each contact
    const contacts: Contact[] = await Promise.all(
        retrievedContacts.map(fetchDeliveryServiceProfile(connection)),
    );
    // Loop through each contact
    contacts.forEach((contact) => {
        // Find a contact with the same profile as the current contact
        const found = contacts.find(
            (innerContact) =>
                innerContact.account.profile &&
                contact.account.profile &&
                stringify(innerContact.account.profile) ===
                    stringify(contact.account.profile),
        );

        // If a contact with the same profile was found and it is not the same contact
        if (found && found?.account.ensName !== contact.account.ensName) {
            // Determine which contact has the shorter ENS name
            dispatch({
                type: UserDbType.hideContact,
                payload:
                    found.account.ensName.length >
                    contact.account.ensName.length
                        ? {
                              ensName: found.account.ensName,
                              aka: contact.account.ensName,
                          }
                        : {
                              ensName: contact.account.ensName,
                              aka: found.account.ensName,
                          },
            });
        }
    });

    dispatch({ type: AccountsType.SetContacts, payload: contacts });
    // If there is a contract already selected in the state and that contract contains a profile
    // with a public encryption key and a public signing key. We're going to use that contact
    if (
        selectedContact &&
        !selectedContact?.account.profile?.publicEncryptionKey &&
        retrievedContacts.find(
            (contact: Account) =>
                normalizeEnsName(contact.ensName) ===
                normalizeEnsName(selectedContact.account.ensName),
        )?.profile?.publicSigningKey
    ) {
        setSelectedContact(
            contacts.find(
                (contact) =>
                    normalizeEnsName(contact.account.ensName) ===
                    normalizeEnsName(selectedContact.account.ensName),
            ),
        );
        //If there is no selected contact and there is a default contact, we're going to use that contact
    } else if (!selectedContact && defaultContacts.length > 0) {
        const contactToSelect = contacts.find(
            (account: Contact) =>
                normalizeEnsName(account.account.ensName) ===
                normalizeEnsName(defaultContacts[0]),
        );
        //The first default contract will be selected
        setSelectedContact(contactToSelect);
    }

    contacts.forEach((contact) => {
        if (contact.deliveryServiceProfile) {
            getConversation(
                contact.account.ensName,
                contacts.map((contact) => contact.account),
                userDb,
            )
                .filter(
                    (message) =>
                        message.messageState === MessageState.Created &&
                        contact.account.profile?.publicEncryptionKey,
                )
                .forEach(async (message) => {
                    await submitMessage(
                        connection,
                        deliveryServiceToken,
                        {
                            deliverServiceProfile:
                                contact.deliveryServiceProfile!,
                            from: connection.account!,
                            keys: userDb.keys,
                            to: contact.account,
                        },
                        message.envelop.message,
                        false,
                        storeMessages,
                    );
                });
        }
    });
}
