import { UserProfile } from '../account';

/**
 * Contains a user profile and an array of signatures made by the profileService
 * This is not a {@see SignedUserProfile} because the signatures are not made by the profile owner
 */
export interface OffchainUserProfile {
    profile: UserProfile;
    signatures: string[];
}
