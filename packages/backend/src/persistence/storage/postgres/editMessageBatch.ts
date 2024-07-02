import { PrismaClient } from '@prisma/client';
import { getOrCreateAccount } from './utils/getOrCreateAccount';
import { getOrCreateConversation } from './utils/getOrCreateConversation';
import { MessageRecord } from './dto/MessageRecord';

export const editMessageBatch =
    (db: PrismaClient) =>
    async (
        ensName: string,
        encryptedContactName: string,
        editMessageBatchPayload: MessageRecord[],
    ) => {
        console.log('editMessageBatchPayload', editMessageBatchPayload);
        const account = await getOrCreateAccount(db, ensName);

        await Promise.all(
            editMessageBatchPayload.map(async (payload) => {
                const conversation = await getOrCreateConversation(
                    db,
                    account.id,
                    encryptedContactName,
                );

                const messageExists = await db.encryptedMessage.findFirst({
                    where: {
                        id: payload.messageId,
                    },
                });

                if (!messageExists) {
                    return await db.encryptedMessage.create({
                        data: {
                            ownerId: account.id,
                            id: payload.messageId,
                            conversationId: conversation.id,
                            encryptedContactName,
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
