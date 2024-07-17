import { IDatabase } from './IDatabase';
import * as Profile from './profile';

import { PrismaClient } from '@prisma/client';

export async function getDatabase(db?: PrismaClient): Promise<IDatabase> {
    const prismaClient = db ?? (await getDbClient());

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
        removeAlias: Profile.removeAlias(prismaClient),
    };
}

export async function getDbClient() {
    console.info('create db connection');
    return new PrismaClient();
}
