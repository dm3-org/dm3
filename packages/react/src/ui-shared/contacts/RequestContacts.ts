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
            log('[fetchDeliverServicePorfile] Cant resolve deliveryServiceUrl');
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
    defaultContact?: string,
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

    let retrievedContacts = await getContacts(
        connection,
        userDb,
        deliveryServiceToken,
        createEmptyConversationEntry,
    );

    if (
        defaultContact &&
        !retrievedContacts.find(
            (account: Account) =>
                normalizeEnsName(account.ensName) ===
                normalizeEnsName(defaultContact),
        )
    ) {
        createEmptyConversationEntry(defaultContact);

        retrievedContacts = await getContacts(
            connection,
            userDb,
            deliveryServiceToken,
            createEmptyConversationEntry,
        );
    }

    const contacts: Contact[] = await Promise.all(
        retrievedContacts.map(fetchDeliveryServiceProfile(connection)),
    );

    contacts.forEach((contact) => {
        const found = contacts.find(
            (innerContact) =>
                innerContact.account.profile &&
                contact.account.profile &&
                stringify(innerContact.account.profile) ===
                    stringify(contact.account.profile),
        );
        if (found && found?.account.ensName !== contact.account.ensName) {
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
    } else if (!selectedContact && defaultContact) {
        const contactToSelect = contacts.find(
            (account: Contact) =>
                normalizeEnsName(account.account.ensName) ===
                normalizeEnsName(defaultContact),
        );

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
