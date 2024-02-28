import { PrismaClient } from '@prisma/client';

export const getOrCreateConversation = async (
    db: PrismaClient,
    accountId: string,
    encryptedContactName: string,
) => {
    //Check if conversation already exists
    const conversation = await db.conversation.findFirst({
        where: {
            accountId,
            encryptedId: encryptedContactName,
        },
    });
    //If conversation exists, return it
    if (conversation) {
        return conversation;
    }
    //If conversation does not exist, create it
    return await db.conversation.create({
        data: {
            accountId,
            encryptedId: encryptedContactName,
        },
    });
};
