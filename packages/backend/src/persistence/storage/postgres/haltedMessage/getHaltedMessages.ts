import { PrismaClient } from '@prisma/client';

export const getHaltedMessages =
    (db: PrismaClient) => async (ensName: string) => {
        //Find the account first we want to get the messages for
        const account = await db.account.findFirst({
            where: {
                id: ensName,
            },
        });

        //If the contact does not exist, return an empty array
        if (!account) {
            return [];
        }

        const messageRecord = await db.encryptedMessage.findMany({
            where: {
                ownerId: account.id,
                isHalted: true,
            },
        });

        if (messageRecord.length === 0) {
            return [];
        }

        return messageRecord.map((message: any) => ({
            messageId: message.id,
            encryptedEnvelopContainer: message.encryptedEnvelopContainer,
            createdAt: message.createdAt,
            isHalted: message.isHalted,
        }));
    };
