import { PrismaClient } from '@prisma/client';
import { ConversationRecord } from './dto/ConversationRecord';
export const getConversationList =
    (db: PrismaClient) =>
    async (
        ensName: string,
        pagesize: number,
        offset: number,
    ): Promise<ConversationRecord[]> => {
        //Find the account first we want to get the conversations for
        const account = await db.account.findFirst({
            where: {
                id: ensName,
            },
        });
        //If the contact does not exist, return an empty array
        if (!account) {
            return [];
        }

        const conversations = await db.conversation.findMany({
            //The pages that have to be skipped
            skip: offset * pagesize,
            //The requested page size
            take: pagesize,
            where: {
                accountId: account.id,
                isHidden: false,
            },
            orderBy: {
                updatedAt: 'desc',
            },
        });

        //The client previews a message for each conversation. Hence we need to get the latest message for each conversation
        const previewMessages = await Promise.all(
            conversations.map(async (c: any) => {
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

        return conversations.map((c: any, idx: number) => ({
            contact: c.encryptedContactName,
            //Return the encrypted message container of the latest message, or null if there are no messages
            previewMessage:
                previewMessages[idx]?.encryptedEnvelopContainer ?? null,
            updatedAt: c.updatedAt,
            encryptedProfileLocation: c.encryptedProfileLocation,
        }));
    };
