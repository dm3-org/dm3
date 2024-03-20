import { PrismaClient } from '@prisma/client';

export function getProfileAliasByAddress(db: PrismaClient) {
    return async (address: string): Promise<string | null> => {
        const profileContainer = await db.profileContainer.findUnique({
            where: {
                address,
            },
        });

        if (!profileContainer) {
            return null;
        }

        const alias = await db.alias.findUnique({
            where: {
                profileContainerId: profileContainer?.id,
            },
        });

        global.logger.debug({
            message: 'getProfileContainerByAddress',
            address,
            alias,
        });

        return alias ? alias.alias : null;
    };
}
