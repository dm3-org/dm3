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
        setUserProfile: Profile.setUserProfile(prismaClient),
        getProfileContainer: Profile.getProfileContainer(prismaClient),
        getProfileContainerByAddress:
            Profile.getProfileContainerByAddress(prismaClient),
        removeUserProfile: Profile.removeUserProfile(prismaClient),
        setAlias: Profile.setAlias(prismaClient),
        getProfileContainerForAlias:
            Profile.getProfileContainerForAlias(prismaClient),
        getProfileAliasByAddress:
            Profile.getProfileAliasByAddress(prismaClient),
    };
}

export async function getDbClient(logger: winston.Logger) {
    logger.info('create db connection');

    return new PrismaClient();
}
