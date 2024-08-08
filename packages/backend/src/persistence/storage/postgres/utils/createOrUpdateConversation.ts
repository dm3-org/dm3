import { PrismaClient } from '@prisma/client';

export const createOrUpdateConversation = async (
    db: PrismaClient,
    accountId: string,
    encryptedContactName: string,
    encryptedProfileLocation: string,
) => {
    //Check if conversation already exists
    const conversation = await db.conversation.findFirst({
        where: {
            accountId,
            encryptedContactName,
        },
    });
    if (conversation) {
        //If a conversation already exist. Update the encryptedProfileLocation.
        //At the moemnt this is the only updatable field
        await db.conversation.update({
            where: {
                id: conversation.id,
            },
            data: {
                encryptedProfileLocation,
            },
        });

        //If conversation exists, return it
        return conversation;
    }
    //If conversation does not exist, create it
    return await db.conversation.create({
        data: {
            accountId,
            encryptedProfileLocation,
            encryptedContactName,
            //Internal field to order conversations properly
            //Will set whenever a conversation is created or a message is added
            updatedAt: new Date(),
        },
    });
};
