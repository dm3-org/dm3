import axios from 'axios';
import * as Lib from 'dm3-lib';
import { Actions } from '../../GlobalContextProvider';
import { AccountsType } from '../../reducers/Accounts';
import { Contact, GlobalState } from '../../reducers/shared';
import { UserDbType } from '../../reducers/UserDB';
import { Account } from 'dm3-lib/dist/profile/src/Profile';
import { getContacts } from './getContacts';
import { submitMessage } from '../../../context/messageContext/submitMessage/submitMessage';

function fetchDeliveryServiceProfile(connection: Lib.Connection) {
    return async (account: Lib.profile.Account): Promise<Contact> => {
        const deliveryServiceUrl = account.profile?.deliveryServices[0];

        //This is most likely the case when the profile can't be fetched at all.

        if (!deliveryServiceUrl) {
            Lib.log(
                '[fetchDeliverServicePorfile] Cant resolve deliveryServiceUrl',
            );
            return {
                account,
            };
        }

        const deliveryServiceProfile =
            await Lib.profile.getDeliveryServiceProfile(
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

    const storeMessages = (
        conversations: Lib.storage.StorageEnvelopContainer[],
    ) =>
        conversations.forEach((conversation) =>
            dispatch({
                type: UserDbType.addMessage,
                payload: {
                    container: conversation,
                    connection: state.connection,
                },
            }),
        );

    let retrievedContacts = await Lib.profile.getContacts(
        connection,
        userDb,
        deliveryServiceToken,
        createEmptyConversationEntry,
    );

    if (
        defaultContact &&
        !retrievedContacts.find(
            (account: Account) =>
                Lib.profile.normalizeEnsName(account.ensName) ===
                Lib.profile.normalizeEnsName(defaultContact),
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
    z;
    const contacts: Contact[] = await Promise.all(
        retrievedContacts.map(fetchDeliveryServiceProfile(connection)),
    );

    contacts.forEach((contact) => {
        const found = contacts.find(
            (innerContact) =>
                innerContact.account.profile &&
                contact.account.profile &&
                Lib.stringify(innerContact.account.profile) ===
                    Lib.stringify(contact.account.profile),
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
            (contact: Lib.profile.Account) =>
                Lib.profile.normalizeEnsName(contact.ensName) ===
                Lib.profile.normalizeEnsName(selectedContact.account.ensName),
        )?.profile?.publicSigningKey
    ) {
        setSelectedContact(
            contacts.find(
                (contact) =>
                    Lib.profile.normalizeEnsName(contact.account.ensName) ===
                    Lib.profile.normalizeEnsName(
                        selectedContact.account.ensName,
                    ),
            ),
        );
    } else if (!selectedContact && defaultContact) {
        const contactToSelect = contacts.find(
            (account: Contact) =>
                Lib.profile.normalizeEnsName(account.account.ensName) ===
                Lib.profile.normalizeEnsName(defaultContact),
        );

        setSelectedContact(contactToSelect);
    }

    contacts.forEach((contact) => {
        if (contact.deliveryServiceProfile) {
            Lib.storage
                .getConversation(
                    contact.account.ensName,
                    contacts.map((contact) => contact.account),
                    userDb,
                )
                .filter(
                    (message) =>
                        message.messageState ===
                            Lib.messaging.MessageState.Created &&
                        contact.account.profile?.publicEncryptionKey,
                )
                .forEach(async (message) => {
                    await submitMessage(
                        connection,
                        deliveryServiceToken,
                        {
                            deliveryServiceEncryptionPubKey:
                                contact.deliveryServiceProfile!
                                    .publicEncryptionKey,
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
