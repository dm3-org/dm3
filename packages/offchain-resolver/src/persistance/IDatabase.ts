import * as Lib from 'dm3-lib/dist.backend';

export interface IDatabase {
    getUserProfile(name: string): Promise<Lib.profile.UserProfile | null>;
    getUserProfileByAddress(
        address: string,
    ): Promise<Lib.profile.UserProfile | null>;
    setUserProfile(
        ensName: string,
        offchainUserProfile: Lib.profile.SignedUserProfile,
        address: string,
    ): Promise<boolean>;
    hasAddressProfile(name: string): Promise<boolean>;
    getAddressByName(nameHash: string): Promise<string | null>;
    getNameByAddress(address: string): Promise<string | null>;
}
