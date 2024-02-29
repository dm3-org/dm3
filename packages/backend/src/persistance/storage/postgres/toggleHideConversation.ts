import { PrismaClient } from '@prisma/client';

export const toggleHideConversation = (prisma: PrismaClient) => {
    return async (
        ensName: string,
        encryptedContactName: string,
        isHidden: boolean,
    ) => {
        const account = await prisma.account.findFirst({
            where: {
                id: ensName,
            },
        });
        if (!account) {
            return false;
        }
        const conversation = await prisma.conversation.findFirst({
            where: {
                accountId: ensName,
                encryptedContactName,
            },
        });
        if (!conversation) {
            return false;
        }
        await prisma.conversation.update({
            where: {
                id: conversation.id,
            },
            data: {
                isHidden,
            },
        });
        return true;
    };
};
