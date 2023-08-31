import { PrismaClient } from '@prisma/client';
import { SignedUserProfile } from 'dm3-lib-profile';
import { ProfileContainer } from './getProfileContainer';

export function getProfileContainerByAddress(db: PrismaClient) {
    return async (address: string): Promise<ProfileContainer | null> => {
        const profileContainer = await db.profileContainer.findUnique({
            where: {
                address,
            },
        });

        const profileContainerResult =
            profileContainer && profileContainer.profile
                ? {
                      ...profileContainer,
                      profile: JSON.parse(
                          profileContainer.profile.toString(),
                      ) as SignedUserProfile,
                  }
                : null;

        global.logger.debug({
            message: 'getProfileContainerByAddress',
            address,
            profileContainerResult,
        });

        return profileContainerResult;
    };
}
