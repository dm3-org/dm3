import { PrismaClient } from '@prisma/client';

export const getNumberOfConversations =
    (db: PrismaClient) => async (ensName: string) => {
        const account = await db.account.findFirst({
            where: {
                id: ensName,
            },
        });
        if (!account) {
            return 0;
        }
        const conversations = await db.conversation.findMany({
            where: {
                accountId: ensName,
            },
        });
        return conversations.length;
    };
