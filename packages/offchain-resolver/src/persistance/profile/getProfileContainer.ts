import { PrismaClient } from '@prisma/client';
import { UserProfile } from 'dm3-lib-profile';
import { ethers } from 'ethers';
import { getProfileContainerForAlias } from './getProfileContainerForAlias';
import { SignedUserProfile } from 'dm3-lib-profile/dist.backend';

export type ProfileContainer = {
    id: string;
    nameHash: string;
    profile: SignedUserProfile;
    ensName: string;
    address: string;
};

export function getProfileContainer(db: PrismaClient) {
    return async (name: string) => {
        const profileContainer = await db.profileContainer.findUnique({
            where: {
                nameHash: ethers.utils.namehash(name),
            },
        });

        if (profileContainer) {
            return profileContainer && profileContainer.profile
                ? {
                      ...profileContainer,
                      profile: JSON.parse(
                          profileContainer.profile.toString(),
                      ) as SignedUserProfile,
                  }
                : null;
        } else {
            // try to find an alias which equlas name
            return await getProfileContainerForAlias(db)(name);
        }
    };
}
