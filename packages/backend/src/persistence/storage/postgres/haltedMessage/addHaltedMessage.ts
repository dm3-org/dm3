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
        try {
            //Create a new halted message
            await db.haltedMessage.create({
                data: {
                    id: messageId,
                    createdAt: new Date(createdAt),
                    encryptedEnvelopContainer,
                    ownerId: account.id,
                },
            });
            return true;
        } catch (err) {
            console.error('addHaltedMessage error ', err);
            return false;
        }
    };
