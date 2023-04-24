import { SignedUserProfile, UserProfile } from 'dm3-lib-profile/dist.backend';

export interface IDatabase {
    getUserProfile(name: string): Promise<UserProfile | null>;
    getUserProfileByAddress(address: string): Promise<UserProfile | null>;
    setUserProfile(
        ensName: string,
        offchainUserProfile: SignedUserProfile,
        address: string,
    ): Promise<boolean>;
    hasAddressProfile(name: string): Promise<boolean>;
    getAddressByName(nameHash: string): Promise<string | null>;
    getNameByAddress(address: string): Promise<string | null>;
}
