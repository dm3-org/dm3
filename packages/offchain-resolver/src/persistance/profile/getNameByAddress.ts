import { PrismaClient } from '@prisma/client';
import { ethersHelper } from 'dm3-lib-shared';

export function getNameByAddress(db: PrismaClient) {
    return async (address: string) => {
        const profileContainer = await db.profileContainer.findUnique({
            where: {
                address: ethersHelper.formatAddress(address),
            },
        });

        return profileContainer ? profileContainer.ensName : null;
    };
}
