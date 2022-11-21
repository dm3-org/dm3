import axios from 'axios';
import * as Lib from 'dm3-lib';
import { ethers } from 'ethers';
import { Contact } from '../reducers/shared';

function fetchDeliveryServiceProfile(connection: Lib.Connection) {
    return async (
        account: Lib.account.Account,
    ): Promise<Contact | undefined> => {
        const deliveryServiceUrl = account.profile?.deliveryServices[0];

        //This is most likely the case when the profile can't be fetched at all.
        if (!deliveryServiceUrl) {
            Lib.log(
                '[fetchDeliverServicePorfile] Cant resolve deliveryServiceUrl',
            );
            return undefined;
        }

        const deliveryServiceProfile =
            await Lib.delivery.getDeliveryServiceProfile(
                deliveryServiceUrl,
                connection,
                async (url) => (await axios.get(url)).data,
            );

        if (!deliveryServiceProfile) {
            Lib.log(
                '[fetchDeliverServicePorfile] Cant resolve deliveryServiceProfile',
            );
            return undefined;
        }

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
    console.log('GOT CONTRACT ', retrievedContacts);

    const contactsWithDeliverService = await Promise.all(
        retrievedContacts.map(fetchDeliveryServiceProfile(connection)),
    );

    //We have to filter all contacts that deliveryServiceProfile could not be resolved.
    const contacts = contactsWithDeliverService.filter(
        (c): c is Contact => !!c,
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
