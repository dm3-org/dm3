import { PrismaClient } from '@prisma/client';
import { getOrCreateAccount } from './utils/getOrCreateAccount';
import { getOrCreateConversation } from './utils/getOrCreateConversation';
export const addConversation =
    (db: PrismaClient) =>
    async (
        ensName: string,
        contactName: string,
        encryptedProfileLocation: string,
    ) => {
        try {
            const account = await getOrCreateAccount(db, ensName);
            await getOrCreateConversation(
                db,
                account.id,
                contactName,
                encryptedProfileLocation,
            );
            return true;
        } catch (e) {
            console.log('addConversation error ', e);
            return false;
        }
    };
