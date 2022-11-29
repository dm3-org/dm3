import axios from 'axios';
import * as Lib from 'dm3-lib';
import { ethers } from 'ethers';
import { Contact } from '../reducers/shared';

export async function requestContacts(
    connection: Lib.Connection,
    deliveryServiceToken: string,
    selectedContact: Contact | undefined,
    setSelectedContact: (contact: Contact | undefined) => void,
    setContacts: (constacts: Contact[]) => void,
    addEnsName: (address: string, name: string) => void,
    userDb: Lib.storage.UserDB,
    createEmptyConversationEntry: (id: string) => void,
    storeMessages: (envelops: Lib.storage.StorageEnvelopContainer[]) => void,
    defaultContact?: string,
) {
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
                Lib.external.formatAddress(accounts.address) ===
                Lib.external.formatAddress(defaultContact),
        )
    ) {
        await Lib.account.addContact(
            connection,
            defaultContact,
            userDb,
            createEmptyConversationEntry,
        );
        retrievedContacts = await Lib.account.getContacts(
            connection,
            userDb,
            deliveryServiceToken,
            createEmptyConversationEntry,
        );
    }

    const contacts = await Promise.all(
        retrievedContacts.map(async (account) => ({
            account,
            deliveryServiceProfile:
                (await Lib.delivery.getDeliveryServiceProfile(
                    account.profile!.deliveryServices[0],
                    connection,
                    async (url) => (await axios.get(url)).data,
                ))!,
        })),
    );

    setContacts(contacts);

    if (
        selectedContact &&
        !selectedContact?.account.profile?.publicEncryptionKey &&
        retrievedContacts.find(
            (contact: Lib.account.Account) =>
                Lib.external.formatAddress(contact.address) ===
                Lib.external.formatAddress(selectedContact.account.address),
        )?.profile?.publicSigningKey
    ) {
        setSelectedContact(
            contacts.find(
                (contact) =>
                    Lib.external.formatAddress(contact.account.address) ===
                    Lib.external.formatAddress(selectedContact.account.address),
            ),
        );
    } else if (!selectedContact && defaultContact) {
        const contactToSelect = contacts.find(
            (accounts) =>
                Lib.external.formatAddress(accounts.account.address) ===
                Lib.external.formatAddress(defaultContact),
        );

        setSelectedContact(contactToSelect);
    }

    (
        await Promise.all(
            retrievedContacts.map(async (contact: Lib.account.Account) => ({
                address: contact.address,
                ens: await Lib.external.lookupAddress(
                    connection.provider as ethers.providers.JsonRpcProvider,
                    contact.address,
                ),
            })),
        )
    )
        .filter(
            (lookup: { address: string; ens: string | null }) =>
                lookup.ens !== null,
        )
        .forEach((lookup: { address: string; ens: string | null }) =>
            addEnsName(lookup.address, lookup.ens as string),
        );

    contacts.forEach((contact) => {
        Lib.storage
            .getConversation(contact.account.address, connection, userDb)
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
                    userDb,
                    contact.account,
                    message.envelop.message,
                    contact.deliveryServiceProfile.publicEncryptionKey,
                    false,
                    storeMessages,
                );
            });
    });
}
