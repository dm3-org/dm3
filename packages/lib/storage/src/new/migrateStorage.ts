import { UserDB } from '../Storage';
import { StorageAPI } from './types';

export const migrageStorage = async (
    oldStorage: UserDB,
    newStorage: StorageAPI,
    resolveTLDtoAlias: (tldDomain: string) => Promise<string>,
) => {
    const conversations = oldStorage.conversations;
    //get keys of conversations map
    const keys = Array.from(conversations.keys());

    console.log('migrating conversations', oldStorage);
    await Promise.all(
        keys.map(async (contactName) => {
            const aliasName = await resolveTLDtoAlias(contactName);
            const messages = await oldStorage.conversations.get(contactName);
            await newStorage.addMessageBatch(aliasName, messages ?? []);
        }),
    );
};
