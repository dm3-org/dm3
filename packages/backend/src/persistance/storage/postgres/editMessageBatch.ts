import { PrismaClient } from '@prisma/client';
import { getOrCreateAccount } from './utils/getOrCreateAccount';
import { getOrCreateConversation } from './utils/getOrCreateConversation';
import { MessageRecord } from './utils/MessageRecord';

export const editMessageBatch =
    (db: PrismaClient) =>
    async (
        ensName: string,
        contactName: string,
        editMessageBatchPayload: MessageRecord[],
    ) => {
        const account = await getOrCreateAccount(db, ensName);

        await Promise.all(
            editMessageBatchPayload.map(async (payload) => {
                const conversation = await getOrCreateConversation(
                    db,
                    account.id,
                    contactName,
                );

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
