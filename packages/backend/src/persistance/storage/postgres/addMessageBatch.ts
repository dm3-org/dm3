import { PrismaClient } from '@prisma/client';
import { MessageBatch } from './editMessageBatch';

export const addMessageBatch =
    (db: PrismaClient) =>
    async (
        ensName: string,
        contactName: string,
        messageBatch: MessageBatch[],
    ) => {
        try {
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

            let conversation = await db.conversation.findFirst({
                where: {
                    accountId: ensName,
                    encryptedId: contactName,
                },
            });

            if (!conversation) {
                console.log('Creating conversation');
                conversation = await db.conversation.create({
                    data: {
                        accountId: ensName,
                        encryptedId: contactName,
                    },
                });
                addMessageBatch;
            }

            const createMessagePromises = messageBatch.map(
                ({ messageId, encryptedEnvelopContainer }) => {
                    return db.encryptedMessage.create({
                        data: {
                            id: messageId,
                            conversationId: contactName,
                            encryptedEnvelopContainer,
                        },
                    });
                },
            );

            await db.$transaction(createMessagePromises);

            return true;
        } catch (e) {
            console.log('addMessageBatch error ', e);
            return false;
        }
    };
