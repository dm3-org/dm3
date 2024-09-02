import { PrismaClient } from '@prisma/client';
import { createOrUpdateConversation } from './utils/createOrUpdateConversation';
import { getOrCreateAccount } from './utils/getOrCreateAccount';
export const addConversation =
    (db: PrismaClient) =>
    async (
        ensName: string,
        contactName: string,
        encryptedProfileLocation: string,
    ) => {
        try {
            const account = await getOrCreateAccount(db, ensName);
            await createOrUpdateConversation(
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
