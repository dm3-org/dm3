import * as Lib from 'dm3-lib/dist.backend';

export interface IDatabase {
    getUserProfile(name: string): Promise<Lib.account.UserProfile | null>;
    getUserProfileByAddress(
        address: string,
    ): Promise<Lib.account.UserProfile | null>;
    setUserProfile(
        ensName: string,
        offchainUserProfile: Lib.account.UserProfile,
        address: string,
    ): Promise<boolean>;
    hasAddressProfile(name: string): Promise<boolean>;
    getAddressByName(nameHash: string): Promise<string | null>;
}
