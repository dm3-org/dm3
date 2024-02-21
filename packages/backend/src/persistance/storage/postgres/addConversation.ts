import { PrismaClient } from '@prisma/client';
export const addConversation =
    (db: PrismaClient) => async (contactName: string) => {
        await db.conversation.create({
            data: {
                id: contactName,
            },
        });
    };
