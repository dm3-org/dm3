import { PrismaClient } from '@prisma/client';

export const getNumberOfMessages =
    (db: PrismaClient) =>
    async (ensName: string, encryptedContactName: string) => {
        const account = await db.account.findFirst({
            where: {
                id: ensName,
            },
        });
        if (!account) {
            return 0;
        }
        const conversation = await db.conversation.findFirst({
            where: {
                accountId: ensName,
                encryptedContactName,
            },
        });
        if (!conversation) {
            return 0;
        }
        const messages = await db.encryptedMessage.findMany({
            where: {
                encryptedContactName,
            },
        });
        return messages.length;
    };
