import * as Lib from '../../lib';
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
) {
    const retrievedContacts = await Lib.getContacts(
        connection,
        userDb.deliveryServiceToken as string,
        userDb,
        createEmptyConversationEntry,
    );

    setContacts(retrievedContacts);

    if (
        selectedContact &&
        !selectedContact?.publicKeys?.publicMessagingKey &&
        retrievedContacts.find(
            (contact: Lib.Account) =>
                Lib.formatAddress(contact.address) ===
                Lib.formatAddress(selectedContact.address),
        )?.publicKeys
    ) {
        setSelectedContact(
            retrievedContacts.find(
                (contact: Lib.Account) =>
                    Lib.formatAddress(contact.address) ===
                    Lib.formatAddress(selectedContact.address),
            ),
        );
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
                    contact.publicKeys?.publicMessagingKey,
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
