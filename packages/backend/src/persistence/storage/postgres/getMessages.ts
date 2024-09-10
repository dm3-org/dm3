import { PrismaClient } from '@prisma/client';

export const getMessages =
    (db: PrismaClient) =>
    async (
        ensName: string,
        encryptedContactName: string,
        pageSize: number,
        offset: number,
    ) => {
        //Find the account first we want to get the messages for
        const account = await db.account.findFirst({
            where: {
                id: ensName,
            },
        });

        //If the contact does not exist, return an empty array
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
                skip: offset * pageSize,
                take: pageSize,
                where: {
                    ownerId: account.id,
                    encryptedContactName,
                },
                orderBy: {
                    createdAt: 'desc',
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
