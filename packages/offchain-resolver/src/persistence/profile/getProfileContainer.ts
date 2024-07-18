import { PrismaClient } from '@prisma/client';
import { UserProfile } from '@dm3-org/dm3-lib-profile';
import { ethers } from 'ethers';
import { getProfileContainerForAlias } from './getProfileContainerForAlias';
import { SignedUserProfile } from '@dm3-org/dm3-lib-profile';

export type ProfileContainer = {
    id: string;
    nameHash: string;
    profile: SignedUserProfile;
    ensName: string;
    address: string;
};

export function getProfileContainer(db: PrismaClient) {
    return async (name: string) => {
        console.debug({
            message: 'getProfileContainer call',
            nameHash: ethers.utils.namehash(name),
            name,
        });
        const profileContainer = await db.profileContainer.findUnique({
            where: {
                nameHash: ethers.utils.namehash(name),
            },
        });

        if (profileContainer) {
            const profileContainerResult =
                profileContainer && profileContainer.profile
                    ? {
                          ...profileContainer,
                          profile: JSON.parse(
                              profileContainer.profile.toString(),
                          ) as SignedUserProfile,
                      }
                    : null;
            console.debug({
                message: 'getProfileContainer found',
                nameHash: ethers.utils.namehash(name),
                profileContainerResult,
            });

            return profileContainerResult;
        } else {
            console.debug({
                message: 'getProfileContainer not found',
                nameHash: ethers.utils.namehash(name),
            });
            // try to find an alias which equlas name
            return await getProfileContainerForAlias(db)(name);
        }
    };
}
