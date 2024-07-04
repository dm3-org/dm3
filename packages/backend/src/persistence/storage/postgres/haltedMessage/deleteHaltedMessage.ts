import { PrismaClient } from '@prisma/client';

export const deleteHaltedMessage =
    (db: PrismaClient) => async (ensName: string, messageId: string) => {
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

        try {
            await db.haltedMessage.delete({
                where: {
                    id: messageId,
                },
            });
            return true;
        } catch (e) {
            console.error('deleteHaltedMessage error', e);
            return false;
        }
    };
