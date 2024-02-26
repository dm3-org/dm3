import { PrismaClient } from '@prisma/client';

export const addMessage =
    (db: PrismaClient) =>
    async (
        ensName: string,
        contactName: string,
        messageId: string,
        encryptedEnvelopContainer: string,
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
                conversation = await db.conversation.create({
                    data: {
                        encryptedId: contactName,
                        accountId: ensName,
                    },
                });
            }

            await db.encryptedMessage.create({
                data: {
                    id: messageId,
                    conversationId: conversation.encryptedId,
                    encryptedEnvelopContainer,
                },
            });

            return true;
        } catch (e) {
            console.log('addMessage error ', e);
            return false;
        }
    };
