import { PrismaClient } from '@prisma/client';
import { MessageRecord } from '../dto/MessageRecord';
import { getOrCreateAccount } from '../utils/getOrCreateAccount';

export const addHaltedMessage =
    (db: PrismaClient) =>
    async (
        ensName: string,
        { messageId, createdAt, encryptedEnvelopContainer }: MessageRecord,
    ) => {
        const account = await getOrCreateAccount(db, ensName);

        //Create a new halted message
        return await db.haltedMessage.create({
            data: {
                id: messageId,
                createdAt: new Date(createdAt),
                encryptedEnvelopContainer,
                ownerId: account.id,
            },
        });
    };
