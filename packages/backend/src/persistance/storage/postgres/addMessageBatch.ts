import { PrismaClient } from '@prisma/client';
import { getOrCreateAccount } from './utils/getOrCreateAccount';
import { getOrCreateConversation } from './utils/getOrCreateConversation';
import { MessageRecord } from './utils/MessageRecord';

export const addMessageBatch =
    (db: PrismaClient) =>
    async (
        ensName: string,
        encryptedContactName: string,
        messageBatch: MessageRecord[],
    ) => {
        try {
            const account = await getOrCreateAccount(db, ensName);

            const conversation = await getOrCreateConversation(
                db,
                account.id,
                encryptedContactName,
            );

            const createMessagePromises = messageBatch.map(
                ({ messageId, encryptedEnvelopContainer }) => {
                    return db.encryptedMessage.create({
                        data: {
                            ownerId: account.id,
                            id: messageId,
                            conversationId: conversation.id,
                            encryptedContactName,
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
