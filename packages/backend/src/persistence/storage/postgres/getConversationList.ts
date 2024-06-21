import { PrismaClient } from '@prisma/client';
import { create } from 'domain';
export const getConversationList =
    (db: PrismaClient) =>
    async (ensName: string, size: number, offset: number) => {
        const account = await db.account.findFirst({
            where: {
                id: ensName,
            },
        });
        if (!account) {
            return [];
        }

        const conversations = await db.conversation.findMany({
            //The pages that have to be skipped
            skip: offset * size,
            //The requested page size
            take: size,
            where: {
                accountId: account.id,
                isHidden: false,
            },
            orderBy: {
                createdAt: 'asc',
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
