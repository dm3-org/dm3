import axios from 'axios';
import * as Lib from 'dm3-lib';
import { Actions } from '../GlobalContextProvider';
import { AccountsType } from '../reducers/Accounts';
import { Contact, GlobalState } from '../reducers/shared';
import { UserDbType } from '../reducers/UserDB';

function fetchDeliveryServiceProfile(connection: Lib.Connection) {
    return async (account: Lib.account.Account): Promise<Contact> => {
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
            await Lib.delivery.getDeliveryServiceProfile(
                deliveryServiceUrl,
                connection,
                async (url) => (await axios.get(url)).data,
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

    let retrievedContacts = await Lib.account.getContacts(
        connection,
        userDb,
        deliveryServiceToken,
        createEmptyConversationEntry,
    );

    if (
        defaultContact &&
        !retrievedContacts.find(
            (accounts) =>
                Lib.account.normalizeEnsName(accounts.ensName) ===
                Lib.account.normalizeEnsName(defaultContact),
        )
    ) {
        createEmptyConversationEntry(defaultContact);

        retrievedContacts = await Lib.account.getContacts(
            connection,
            userDb,
            deliveryServiceToken,
            createEmptyConversationEntry,
        );
    }

    const contacts = await Promise.all(
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
            (contact: Lib.account.Account) =>
                Lib.account.normalizeEnsName(contact.ensName) ===
                Lib.account.normalizeEnsName(selectedContact.account.ensName),
        )?.profile?.publicSigningKey
    ) {
        setSelectedContact(
            contacts.find(
                (contact) =>
                    Lib.account.normalizeEnsName(contact.account.ensName) ===
                    Lib.account.normalizeEnsName(
                        selectedContact.account.ensName,
                    ),
            ),
        );
    } else if (!selectedContact && defaultContact) {
        const contactToSelect = contacts.find(
            (accounts) =>
                Lib.account.normalizeEnsName(accounts.account.ensName) ===
                Lib.account.normalizeEnsName(defaultContact),
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
                    await Lib.messaging.submitMessage(
                        connection,
                        deliveryServiceToken,
                        message.envelop.message,
                        {
                            deliveryServiceEncryptionPubKey:
                                contact.deliveryServiceProfile!
                                    .publicEncryptionKey,
                            from: connection.account!,
                            keys: userDb.keys,
                            to: contact.account,
                        },
                        false,
                        storeMessages,
                    );
                });
        }
    });
}
