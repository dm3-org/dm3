import { UserDB, getConversationId } from 'dm3-lib-storage';
import { fetchPendingConversations } from './../../../api/http/conversations/fetchPendingConversations';
import { addContact } from './addContact';
import {
    Account,
    checkUserProfile,
    getUserProfile,
    normalizeEnsName,
} from 'dm3-lib-profile';
import { Connection } from '../../web3provider/Web3Provider';

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
                const profile = await getUserProfile(connection, ensName);
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
