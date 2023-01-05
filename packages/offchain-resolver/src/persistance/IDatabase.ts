import * as Lib from 'dm3-lib/dist.backend';

export interface IDatabase {
    getUserProfile(name: string): Promise<UserProfileDto | null>;
    setUserProfile(
        ensName: string,
        userProfileDto: UserProfileDto,
    ): Promise<boolean>;
}

/**
 * Contains a user profile and an array of signatures made by the profileService
 * This is not a {@see SignedUserProfile} because the signatures are not made by the profile owner
 */
export interface UserProfileDto {
    profile: Lib.account.UserProfile;
    signatures: string[];
}
