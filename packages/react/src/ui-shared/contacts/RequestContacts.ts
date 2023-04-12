import axios from 'axios';
import * as Lib from 'dm3-lib';
import { Contact } from '../../reducers/shared';
import { getContacts } from './getContacts';
import { SubmitMessageType } from '../../../context/messageContext/submitMessage/submitMessage';

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
    connection: Lib.Connection,
    deliveryServiceToken: string,
    selectedContact: Contact | undefined,
    setSelectedContact: (contact: Contact | undefined) => void,
    setContacts: (constacts: Contact[]) => void,
    userDb: Lib.storage.UserDB,
    createEmptyConversationEntry: (id: string) => void,
    storeMessages: (envelops: Lib.storage.StorageEnvelopContainer[]) => void,
    submitMessage: SubmitMessageType,
    defaultContactEnsName?: string,
) {
    let retrievedContacts = await getContacts(
        connection,
        userDb,
        deliveryServiceToken,
        createEmptyConversationEntry,
    );

    if (
        defaultContact &&
        !retrievedContacts.find(
            (accounts) =>
                Lib.profile.normalizeEnsName(accounts.ensName) ===
                Lib.profile.normalizeEnsName(defaultContactEnsName),
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
            (accounts) =>
                Lib.profile.normalizeEnsName(accounts.account.ensName) ===
                Lib.profile.normalizeEnsName(defaultContactEnsName),
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
