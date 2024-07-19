import { PrismaClient } from '@prisma/client';

/// Check if an account exists for a given ENS name
/// @param db
/// @returns true if account exists, false otherwise
export const hasAccount = (db: PrismaClient) => async (ensName: string) => {
    //Check if account exists
    const account = await db.account.findFirst({
        where: {
            id: ensName,
        },
    });

    return !!account;
};
