import axios from 'axios';
import * as Lib from 'dm3-lib';
import { Contact } from '../../reducers/shared';
import { addContact } from './addContact';

export async function getContacts(
    connection: Lib.Connection,
    deliveryServiceToken: string,
    getUserProfile: Lib.account.GetUserProfile,
    getPendingConversations: Lib.external.GetPendingConversations,
    userDb: Lib.storage.UserDB,
    createEmptyConversationEntry: (id: string) => void,
): Promise<Lib.account.Account[]> {
    if (!connection.provider) {
        throw Error('No provider');
    }

    const pendingConversations = await getPendingConversations(
        connection,
        deliveryServiceToken,
    );

    for (const pendingConversation of pendingConversations) {
        if (
            !userDb.conversations.has(
                Lib.storage.getConversationId(
                    Lib.account.normalizeEnsName(connection.account!.ensName),
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
                Lib.account.normalizeEnsName(connection.account!.ensName) ===
                Lib.account.normalizeEnsName(ensNames[0])
                    ? Lib.account.normalizeEnsName(ensNames[1])
                    : Lib.account.normalizeEnsName(ensNames[0]),
            )
            .map(async (ensName) => {
                const profile = await Lib.account.getUserProfile(
                    connection,
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
