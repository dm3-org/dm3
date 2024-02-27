import { PrismaClient } from '@prisma/client';
import { getOrCreateAccount } from './utils/getOrCreateAccount';
import { getOrCreateConversation } from './utils/getOrCreateConversation';
import { MessageRecord } from './utils/MessageRecord';

export const addMessageBatch =
    (db: PrismaClient) =>
    async (
        ensName: string,
        contactName: string,
        messageBatch: MessageRecord[],
    ) => {
        try {
            const account = await getOrCreateAccount(db, ensName);

            await getOrCreateConversation(db, account.id, contactName);

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
