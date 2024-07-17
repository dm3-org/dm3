import { PrismaClient } from '@prisma/client';

export const doesAccountExist =
    (db: PrismaClient) => async (ensName: string) => {
        //Check if account exists
        const account = await db.account.findFirst({
            where: {
                id: ensName,
            },
        });
        //If account exists, return true
        if (account) {
            return true;
        }
        //If account does not exist, return false
        return false;
    };
