import { PrismaClient } from '@prisma/client';
import { UserProfile } from 'dm3-lib-profile';
import { ethersHelper } from 'dm3-lib-shared/dist.backend';

export function getUserProfileByAddress(db: PrismaClient) {
    return async (address: string) => {
        const profileContainer = await db.profileContainer.findUnique({
            where: {
                address: ethersHelper.formatAddress(address),
            },
        });

        return profileContainer && profileContainer.profile
            ? (JSON.parse(profileContainer.profile?.toString()) as UserProfile)
            : null;
    };
}
