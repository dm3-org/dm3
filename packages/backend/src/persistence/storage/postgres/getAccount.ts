import { PrismaClient } from '@prisma/client';

export const getAccount = (db: PrismaClient) => async (ensName: string) => {
    // Find the account
    const account = await db.account.findFirst({
        where: {
            id: ensName,
        },
    });

    // Return the account if it exists
    if (account) {
        return account;
    }

    // If the account does not exist, return null
    return null;
};
