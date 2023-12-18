import axios from 'axios';
import {
    Account,
    getDeliveryServiceProfile,
    getUserProfile,
    normalizeEnsName,
} from 'dm3-lib-profile';
import { log, stringify } from 'dm3-lib-shared';
import {
    UserDB,
    createEmptyConversation,
    getConversationId,
} from 'dm3-lib-storage';
import { Config } from '../interfaces/config';
import { Contact } from '../interfaces/context';
import { Connection } from '../interfaces/web3';
import {
    AccountsType,
    Actions,
    GlobalState,
    UserDbType,
} from '../utils/enum-type-utils';
import { fetchPendingConversations } from './messages';

export async function requestContacts(
    account: Account,
    deliveryServiceToken: string,
    state: GlobalState,
    dispatch: React.Dispatch<Actions>,
    config: Config,
) {
    const connection = state.connection;
    const userDb = state.userDb!;
    const createEmptyConversationEntry = (id: string) =>
        dispatch({
            type: UserDbType.createEmptyConversation,
            payload: id,
        });

    let retrievedContacts = await getContacts(
        connection,
        account,
        userDb,
        deliveryServiceToken,
        createEmptyConversationEntry,
    );

    // adds default contact in the list if it's not present (help.dm3.eth)
    if (
        config.defaultContact &&
        !retrievedContacts.find(
            (account: Account) =>
                normalizeEnsName(account.ensName) ===
                normalizeEnsName(config.defaultContact as string),
        )
    ) {
        createEmptyConversationEntry(config.defaultContact);

        retrievedContacts = await getContacts(
            connection,
            account,
            userDb,
            deliveryServiceToken!,
            createEmptyConversationEntry,
        );
    }

    const contacts: Contact[] = await Promise.all(
        retrievedContacts.map(fetchDeliveryServiceProfile(connection)),
    );

    contacts.forEach((contact) => {
        const found = contacts.find(
            (innerContact) =>
                innerContact.account.profile &&
                contact.account.profile &&
                stringify(innerContact.account.profile) ===
                    stringify(contact.account.profile),
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
}

export async function getContacts(
    connection: Connection,
    account: Account,
    userDb: UserDB,
    deliveryServiceToken: string,
    createEmptyConversationEntry: (id: string) => void,
): Promise<Account[]> {
    const pendingConversations = await fetchPendingConversations(
        connection,
        account,
        deliveryServiceToken,
    );

    for (const pendingConversation of pendingConversations) {
        if (
            !userDb.conversations.has(
                getConversationId(
                    normalizeEnsName(account.ensName),
                    pendingConversation,
                ),
            )
        ) {
            await addContact(
                pendingConversation,
                userDb,
                createEmptyConversationEntry,
            );
        }
    }

    // fetch the user profile of the contacts
    const uncheckedProfiles = await Promise.all(
        Array.from(userDb.conversations.keys())
            .map((conversationId) => conversationId.split(','))
            .map((ensNames) =>
                normalizeEnsName(account.ensName) ===
                normalizeEnsName(ensNames[0])
                    ? normalizeEnsName(ensNames[1])
                    : normalizeEnsName(ensNames[0]),
            )
            .map(async (ensName) => {
                let profile;
                try {
                    profile = await getUserProfile(
                        connection.mainnetProvider!,
                        ensName,
                    );
                    return {
                        ensName,
                        profile: profile,
                    };
                } catch (error) {
                    return {
                        ensName,
                        profile: undefined,
                    };
                }
            }),
    );

    return uncheckedProfiles.map((profileContainer) => ({
        ensName: profileContainer.ensName,
        profile: profileContainer.profile?.profile,
        profileSignature: profileContainer.profile?.signature,
    }));
}

export async function addContact(
    ensName: string,
    userDb: UserDB,
    createEmptyConversationEntry: (id: string) => void,
) {
    createEmptyConversation(ensName, userDb, createEmptyConversationEntry);
}

function fetchDeliveryServiceProfile(connection: Connection) {
    return async (account: Account): Promise<Contact> => {
        const deliveryServiceUrl = account.profile?.deliveryServices[0];

        if (!deliveryServiceUrl) {
            log(
                '[fetchDeliverServicePorfile] Cant resolve deliveryServiceUrl',
                'info',
            );
            return {
                account,
            };
        }

        const deliveryServiceProfile = await getDeliveryServiceProfile(
            deliveryServiceUrl,
            connection.mainnetProvider!,
            async (url: string) => (await axios.get(url)).data,
        );

        return {
            account,
            deliveryServiceProfile,
        };
    };
}
