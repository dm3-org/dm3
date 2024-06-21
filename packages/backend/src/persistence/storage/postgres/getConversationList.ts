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

        //The client previews a message for each conversation. Hence we need to get the latest message for each conversation
        const previewMessage = await Promise.all(
            conversations.map(async (c) => {
                const message = await db.encryptedMessage.findFirst({
                    where: {
                        conversationId: c.id,
                    },
                    orderBy: {
                        createdAt: 'desc',
                    },
                });
                return message;
            }),
        );

        return conversations.map((c: any) => ({
            contact: c.encryptedContactName,
            previewMessage: previewMessage[0],
        }));
    };
