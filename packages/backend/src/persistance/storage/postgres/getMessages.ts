import { PrismaClient } from '@prisma/client';
import { getOrCreateAccount } from './utils/getOrCreateAccount';

const PAGE_SIZE = 100;

export const getMessages =
    (db: PrismaClient) =>
    async (ensName: string, contactName: string, page: number) => {
        const account = await getOrCreateAccount(db, ensName);
        const conversation = await db.conversation.findFirst({
            where: {
                accountId: ensName,
                encryptedId: contactName,
            },
        });

        if (!conversation) {
            return [];
        }

        try {
            const messageRecord = await db.encryptedMessage.findMany({
                skip: page * PAGE_SIZE,
                take: PAGE_SIZE,
                where: {
                    ownerId: account.id,
                    conversationId: conversation.encryptedId,
                },
            });
            if (messageRecord.length === 0) {
                return [];
            }

            return messageRecord.map((message: any) => JSON.stringify(message));
        } catch (e) {
            console.log('getMessages error', e);
            return [];
        }
    };
