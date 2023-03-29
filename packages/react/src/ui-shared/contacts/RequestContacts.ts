import axios from 'axios';
import * as Lib from 'dm3-lib';
import { Contact } from '../../reducers/shared';
import { getContacts } from './getContacts';
import { SubmitMessageType } from '../../../context/messageContext/submitMessage/submitMessage';

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
            await Lib.account.getDeliveryServiceProfile(
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
        defaultContactEnsName &&
        !retrievedContacts.find(
            (accounts) =>
                Lib.account.normalizeEnsName(accounts.ensName) ===
                Lib.account.normalizeEnsName(defaultContactEnsName),
        )
    ) {
        createEmptyConversationEntry(defaultContactEnsName);

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

    setContacts(contacts);

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
    } else if (!selectedContact && defaultContactEnsName) {
        const contactToSelect = contacts.find(
            (accounts) =>
                Lib.account.normalizeEnsName(accounts.account.ensName) ===
                Lib.account.normalizeEnsName(defaultContactEnsName),
        );

        setSelectedContact(contactToSelect);
    }

    contacts.forEach((contact) => {
        if (contact.deliveryServiceProfile) {
            Lib.storage
                .getConversation(contact.account.ensName, userDb)
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
