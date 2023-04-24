import { UserDB, createEmptyConversation } from 'dm3-lib-storage';
import { Connection } from '../../web3provider/Web3Provider';

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
