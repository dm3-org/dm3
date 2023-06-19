import { PrismaClient } from '@prisma/client';

export function getAddressByName(db: PrismaClient) {
    return async (nameHash: string) => {
        const profileContainer = await db.profileContainer.findUnique({
            where: {
                nameHash,
            },
        });

        return profileContainer ? profileContainer.address : null;
    };
}
