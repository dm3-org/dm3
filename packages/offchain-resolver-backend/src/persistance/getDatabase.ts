import { IDatabase } from './IDatabase';
import * as Profile from './profile';
import winston from 'winston';
import { PrismaClient } from '@prisma/client';

export async function getDatabase(
    logger: winston.Logger,
    db?: PrismaClient,
): Promise<IDatabase> {
    const prismaClient = db ?? (await getDbClient(logger));

    return {
        getUserProfile: Profile.getUserProfile(prismaClient),
        setUserProfile: Profile.setUserProfile(prismaClient),
        getUserProfileByAddress: Profile.getUserProfileByAddress(prismaClient),
        hasAddressProfile: Profile.hasAddressProfile(prismaClient),
        getAddressByName: Profile.getAddressByName(prismaClient),
        getNameByAddress: Profile.getNameByAddress(prismaClient),
    };
}

export async function getDbClient(logger: winston.Logger) {
    logger.info('create db connection');

    return new PrismaClient();
}
