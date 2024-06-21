import { PrismaClient } from '@prisma/client';

const PAGE_SIZE = 100;

export const getMessages =
    (db: PrismaClient) =>
    async (ensName: string, encryptedContactName: string, page: number) => {
        const account = await db.account.findFirst({
            where: {
                id: ensName,
            },
        });

        if (!account) {
            return [];
        }

        const conversation = await db.conversation.findFirst({
            where: {
                accountId: ensName,
                encryptedContactName,
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
                    encryptedContactName,
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
