import axios from 'axios';
import * as Lib from 'dm3-lib';
import { Contact } from '../../reducers/shared';

export async function addContact(
    connection: Lib.Connection,
    ensName: string,
    userDb: Lib.storage.UserDB,
    createEmptyConversationEntry: (id: string) => void,
) {
    if (
        !Lib.storage.createEmptyConversation(
            connection,
            ensName,
            userDb,
            createEmptyConversationEntry,
        )
    ) {
        throw Error('Contact exists already.');
    }
}
