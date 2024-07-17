import { PrismaClient } from '@prisma/client';
import { getOrCreateAccount } from './utils/getOrCreateAccount';

export const setAccount = (db: PrismaClient) => async (ensName: string) => {
    return getOrCreateAccount(db, ensName);
};
