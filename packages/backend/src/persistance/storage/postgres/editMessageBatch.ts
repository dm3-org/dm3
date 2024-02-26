import { PrismaClient } from '@prisma/client';

export type EditMessageBatchPayload = {
    messageId: string;
    encryptedEnvelopContainer: string;
};

export const editMessageBatch =
    (db: PrismaClient) =>
    async (
        ensName: string,
        contactName: string,
        editMessageBatchPayload: EditMessageBatchPayload[],
    ) => {
        let account = await db.account.findFirst({
            where: {
                id: ensName,
            },
        });
        if (!account) {
            //Create account
            account = await db.account.create({
                data: {
                    id: ensName,
                },
            });
        }

        await Promise.all(
            editMessageBatchPayload.map(async (payload) => {
                let conversation = await db.conversation.findFirst({
                    where: {
                        accountId: ensName,
                        encryptedId: contactName,
                    },
                });

                if (!conversation) {
                    conversation = await db.conversation.create({
                        data: {
                            encryptedId: contactName,
                            accountId: ensName,
                        },
                    });
                }
                const messageExists = await db.encryptedMessage.findFirst({
                    where: {
                        id: payload.messageId,
                    },
                });

                if (!messageExists) {
                    return await db.encryptedMessage.create({
                        data: {
                            id: payload.messageId,
                            conversationId: conversation.encryptedId,
                            encryptedEnvelopContainer:
                                payload.encryptedEnvelopContainer,
                        },
                    });
                }

                await db.encryptedMessage.update({
                    where: {
                        id: payload.messageId,
                    },
                    data: {
                        encryptedEnvelopContainer:
                            payload.encryptedEnvelopContainer,
                    },
                });
            }),
        );
    };
