export * as schema from '../schema';
export {
    checkStringSignature,
    checkUserProfile,
    checkUserProfileWithAddress,
    getAccountDisplayName,
    getBrowserStorageKey,
    getProfileCreationMessage,
    normalizeEnsName,
    PROFILE_RECORD_NAME,
} from './Account';
export type {
    Account,
    ProfileKeys,
    SignedUserProfile,
    UserProfile,
    GetResource,
} from './Account';
export * from './profileResolver';

export type { ProfileExtension } from './profileExtension';
export * from './profileExtension';
