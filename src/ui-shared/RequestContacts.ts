import * as Lib from '../lib';
import { ethers } from 'ethers';

export async function requestContacts(
    connection: Lib.ApiConnection,
    selectedContact: Lib.Account | undefined,
    setSelectedContact: (account: Lib.Account | undefined) => void,
    setContacts: (constacts: Lib.Account[]) => void,
    ensNames: Map<string, string>,
    setEnsNames: (ensNames: Map<string, string>) => void,
) {
    const retrievedContacts = await Lib.getContacts(
        (connection.account as Lib.Account).address,
        connection.sessionToken as string,
    );

    setContacts(retrievedContacts);

    if (
        selectedContact &&
        !selectedContact?.keys?.publicMessagingKey &&
        retrievedContacts.find(
            (contact: Lib.Account) =>
                Lib.formatAddress(contact.address) ===
                Lib.formatAddress(selectedContact.address),
        )?.keys
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
            ensNames.set(lookup.address, lookup.ens as string),
        );

    setEnsNames(new Map(ensNames));
}
