import { PrismaClient } from '@prisma/client';

export const clearHaltedMessage =
    (db: PrismaClient) =>
    /**
     *
     * @param ensName the ensName the messages have been stored originally i.E alice.eth
     * @param aliasName the aliasNamespace the cleint uses after resolving the ensName i.E Alice. ie addr.user.dm3.eth
     * @param messageId the messageId
     * @returns
     */
    async (ensName: string, aliasName: string, messageId: string) => {
        //Find the account first we want to get the messages for
        const account = await db.account.findFirst({
            where: {
                id: ensName,
            },
        });
        //If the contact does not exist, there is no message that can be deleted
        if (!account) {
            return false;
        }

        const message = await db.encryptedMessage.findFirst({
            where: {
                id: messageId,
            },
        });

        if (!message) {
            return false;
        }

        try {
            await db.encryptedMessage.update({
                where: {
                    id: messageId,
                },
                data: {
                    //Message is no longer halted
                    isHalted: false,
                    //Use alias name
                    encryptedContactName: aliasName,
                },
            });

            await db.conversation.update({
                where: {
                    id: message.conversationId,
                },
                data: {
                    encryptedContactName: aliasName,
                },
            });
            return true;
        } catch (e) {
            console.error('clear halted error', e);
            return false;
        }
    };
