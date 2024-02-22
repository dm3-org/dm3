import { PrismaClient } from '@prisma/client';
export const getConversationList =
    (db: PrismaClient) => async (ensName: string) => {
        const account = await db.account.findFirst({
            where: {
                id: ensName,
            },
        });
        if (!account) {
            return [];
        }
        console.log('get conversations for ', ensName);
        const conversations = await db.conversation.findMany({
            where: {
                accountId: ensName,
            },
        });
        console.log('get conversations ', conversations);
        return conversations.map((c) => c.encryptedId);
    };
