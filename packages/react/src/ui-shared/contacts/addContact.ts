import * as Lib from 'dm3-lib';

export async function addContact(
    connection: Lib.Connection,
    ensName: string,
    userDb: Lib.storage.UserDB,
    createEmptyConversationEntry: (id: string) => void,
) {
    if (
        !Lib.storage.createEmptyConversation(
            ensName,
            userDb,
            createEmptyConversationEntry,
        )
    ) {
        throw Error('Contact exists already.');
    }
}
