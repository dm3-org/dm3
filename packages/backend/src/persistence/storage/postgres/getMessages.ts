import { PrismaClient } from '@prisma/client';

export const getMessages =
    (db: PrismaClient) =>
    async (
        ensName: string,
        encryptedContactName: string,
        size: number,
        offset: number,
    ) => {
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
                skip: offset * size,
                take: size,
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
