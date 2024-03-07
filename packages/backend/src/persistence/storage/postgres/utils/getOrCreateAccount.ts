import { PrismaClient } from '@prisma/client';

export const getOrCreateAccount = async (db: PrismaClient, ensName: string) => {
    //Check if account exists
    const account = await db.account.findFirst({
        where: {
            id: ensName,
        },
    });
    //If account exists, return it
    if (account) {
        return account;
    }

    //If account does not exist, create it
    return await db.account.create({
        data: {
            id: ensName,
        },
    });
};
