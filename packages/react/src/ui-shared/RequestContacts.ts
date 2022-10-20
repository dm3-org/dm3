import { profile } from 'console';
import * as Lib from 'dm3-lib';
import { ethers } from 'ethers';

export async function requestContacts(
    connection: Lib.Connection,
    selectedContact: Lib.account.Account | undefined,
    setSelectedContact: (account: Lib.account.Account | undefined) => void,
    setContacts: (constacts: Lib.account.Account[]) => void,
    addEnsName: (address: string, name: string) => void,
    userDb: Lib.storage.UserDB,
    createEmptyConversationEntry: (id: string) => void,
    storeMessages: (envelops: Lib.storage.StorageEnvelopContainer[]) => void,
    defaultContact?: string,
) {
    let retrievedContacts = await Lib.account.getContacts(
        connection,
        userDb,
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
            createEmptyConversationEntry,
        );
    }

    setContacts(retrievedContacts);

    if (
        selectedContact &&
        !selectedContact?.profile?.publicEncryptionKey &&
        retrievedContacts.find(
            (contact: Lib.account.Account) =>
                Lib.external.formatAddress(contact.address) ===
                Lib.external.formatAddress(selectedContact.address),
        )?.profile?.publicSigningKey
    ) {
        setSelectedContact(
            retrievedContacts.find(
                (contact: Lib.account.Account) =>
                    Lib.external.formatAddress(contact.address) ===
                    Lib.external.formatAddress(selectedContact.address),
            ),
        );
    } else if (!selectedContact && defaultContact) {
        const contactToSelect = retrievedContacts.find(
            (accounts) =>
                Lib.external.formatAddress(accounts.address) ===
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

    retrievedContacts.forEach((contact) => {
        Lib.storage
            .getConversation(contact.address, connection, userDb)
            .filter(
                (message) =>
                    message.messageState ===
                        Lib.messaging.MessageState.Created &&
                    contact.profile?.publicEncryptionKey,
            )
            .forEach(async (message) => {
                await Lib.messaging.submitMessage(
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
