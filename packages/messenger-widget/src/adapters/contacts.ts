import axios from 'axios';
import { MessageState } from 'dm3-lib-messaging';
import {
    Account,
    checkUserProfile,
    getDeliveryServiceProfile,
    getUserProfile,
    normalizeEnsName,
} from 'dm3-lib-profile';
import { log, stringify } from 'dm3-lib-shared';
import {
    StorageEnvelopContainer,
    getConversation,
    getConversationId,
    UserDB,
    createEmptyConversation,
} from 'dm3-lib-storage';
import { Contact } from '../interfaces/context';
import { Connection } from '../interfaces/web3';
import {
    AccountsType,
    Actions,
    GlobalState,
    UserDbType,
} from '../utils/enum-type-utils';
import { fetchPendingConversations, submitMessage } from './messages';

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

    const storeMessages = (conversations: StorageEnvelopContainer[]) =>
        conversations.forEach((conversation) =>
            dispatch({
                type: UserDbType.addMessage,
                payload: {
                    container: conversation,
                    connection: state.connection,
                },
            }),
        );

    let retrievedContacts = await getContacts(
        connection,
        userDb,
        deliveryServiceToken,
        createEmptyConversationEntry,
    );

    if (
        defaultContact &&
        !retrievedContacts.find(
            (account: Account) =>
                normalizeEnsName(account.ensName) ===
                normalizeEnsName(defaultContact),
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

    if (
        selectedContact &&
        !selectedContact?.account.profile?.publicEncryptionKey &&
        retrievedContacts.find(
            (contact: Account) =>
                normalizeEnsName(contact.ensName) ===
                normalizeEnsName(selectedContact.account.ensName),
        )?.profile?.publicSigningKey
    ) {
        setSelectedContact(
            contacts.find(
                (contact) =>
                    normalizeEnsName(contact.account.ensName) ===
                    normalizeEnsName(selectedContact.account.ensName),
            ),
        );
    } else if (!selectedContact && defaultContact) {
        const contactToSelect = contacts.find(
            (account: Contact) =>
                normalizeEnsName(account.account.ensName) ===
                normalizeEnsName(defaultContact),
        );

        setSelectedContact(contactToSelect);
    }

    contacts.forEach((contact) => {
        if (contact.deliveryServiceProfile) {
            getConversation(
                contact.account.ensName,
                contacts.map((contact) => contact.account),
                userDb,
            )
                .filter(
                    (message) =>
                        message.messageState === MessageState.Created &&
                        contact.account.profile?.publicEncryptionKey,
                )
                .forEach(async (message) => {
                    await submitMessage(
                        connection,
                        deliveryServiceToken,
                        {
                            deliverServiceProfile:
                                contact.deliveryServiceProfile!,
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

export async function getContacts(
    connection: Connection,
    userDb: UserDB,
    deliveryServiceToken: string,
    createEmptyConversationEntry: (id: string) => void,
): Promise<Account[]> {
    if (!connection.provider) {
        throw Error('No provider');
    }

    const pendingConversations = await fetchPendingConversations(
        connection,
        deliveryServiceToken,
    );

    for (const pendingConversation of pendingConversations) {
        if (
            !userDb.conversations.has(
                getConversationId(
                    normalizeEnsName(connection.account!.ensName),
                    pendingConversation,
                ),
            )
        ) {
            await addContact(
                connection,
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
                normalizeEnsName(connection.account!.ensName) ===
                normalizeEnsName(ensNames[0])
                    ? normalizeEnsName(ensNames[1])
                    : normalizeEnsName(ensNames[0]),
            )
            .map(async (ensName) => {
                const profile = await getUserProfile(
                    connection.provider!,
                    ensName,
                );
                return {
                    ensName,
                    profile: profile,
                };
            }),
    );

    // accept if account has a profile and a valid signature
    // accept if there is no profile and no signature
    return (
        await Promise.all(
            uncheckedProfiles.map(async (uncheckedProfile) => ({
                valid:
                    !uncheckedProfile.profile ||
                    (await checkUserProfile(
                        connection.provider!,
                        uncheckedProfile.profile,

                        uncheckedProfile.ensName,
                    )),
                container: uncheckedProfile,
            })),
        )
    )
        .filter((checkedProfile) => checkedProfile.valid)
        .map((profileContainer) => ({
            ensName: profileContainer.container.ensName,
            profile: profileContainer.container.profile?.profile,
        }));
}

export async function addContact(
    connection: Connection,
    ensName: string,
    userDb: UserDB,
    createEmptyConversationEntry: (id: string) => void,
) {
    if (
        !createEmptyConversation(ensName, userDb, createEmptyConversationEntry)
    ) {
        throw Error('Contact exists already.');
    }
}

function fetchDeliveryServiceProfile(connection: Connection) {
    return async (account: Account): Promise<Contact> => {
        const deliveryServiceUrl = account.profile?.deliveryServices[0];

        //This is most likely the case when the profile can't be fetched at all.

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
            connection.provider!,
            async (url: string) => (await axios.get(url)).data,
        );

        return {
            account,
            deliveryServiceProfile,
        };
    };
}
