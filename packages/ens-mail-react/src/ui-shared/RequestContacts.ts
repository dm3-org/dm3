import * as Lib from 'ens-mail-lib';
import { ethers } from 'ethers';

export async function requestContacts(
    connection: Lib.Connection,
    selectedContact: Lib.Account | undefined,
    setSelectedContact: (account: Lib.Account | undefined) => void,
    setContacts: (constacts: Lib.Account[]) => void,
    addEnsName: (address: string, name: string) => void,
    userDb: Lib.UserDB,
    createEmptyConversationEntry: (id: string) => void,
    storeMessages: (envelops: Lib.StorageEnvelopContainer[]) => void,
    defaultContact?: string,
) {
    let retrievedContacts = await Lib.getContacts(
        connection,
        userDb,
        createEmptyConversationEntry,
    );

    if (
        defaultContact &&
        !retrievedContacts.find(
            (accounts) =>
                Lib.formatAddress(accounts.address) ===
                Lib.formatAddress(defaultContact),
        )
    ) {
        await Lib.addContact(
            connection,
            defaultContact,
            userDb,
            createEmptyConversationEntry,
        );
        retrievedContacts = await Lib.getContacts(
            connection,
            userDb,
            createEmptyConversationEntry,
        );
    }

    setContacts(retrievedContacts);

    if (
        selectedContact &&
        !selectedContact?.profile?.publicKeys?.publicMessagingKey &&
        retrievedContacts.find(
            (contact: Lib.Account) =>
                Lib.formatAddress(contact.address) ===
                Lib.formatAddress(selectedContact.address),
        )?.profile?.publicKeys
    ) {
        setSelectedContact(
            retrievedContacts.find(
                (contact: Lib.Account) =>
                    Lib.formatAddress(contact.address) ===
                    Lib.formatAddress(selectedContact.address),
            ),
        );
    } else if (!selectedContact && defaultContact) {
        const contactToSelect = retrievedContacts.find(
            (accounts) =>
                Lib.formatAddress(accounts.address) ===
                Lib.formatAddress(defaultContact),
        );

        setSelectedContact(contactToSelect);
    }

    (
        await Promise.all(
            retrievedContacts.map(async (contact: Lib.Account) => ({
                address: contact.address,
                ens: await Lib.lookupAddress(
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

    retrievedContacts.forEach((contact) => {
        Lib.getConversation(contact.address, connection, userDb)
            .filter(
                (message) =>
                    message.messageState === Lib.MessageState.Created &&
                    contact.profile?.publicKeys?.publicMessagingKey,
            )
            .forEach(async (message) => {
                await Lib.submitMessage(
                    connection,
                    userDb,
                    contact,
                    message.envelop.message,
                    false,
                    storeMessages,
                );
            });
    });
}
