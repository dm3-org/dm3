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
        const conversations = await db.conversation.findMany({
            where: {
                accountId: account.id,
                isHidden: false,
            },
        });
        return conversations.map((c: any) => c.encryptedContactName);
    };
