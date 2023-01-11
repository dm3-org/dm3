import * as Lib from 'dm3-lib/dist.backend';

export interface IDatabase {
    getUserProfile(
        name: string,
    ): Promise<Lib.offchainResolver.OffchainUserProfile | null>;
    setUserProfile(
        ensName: string,
        offchainUserProfile: Lib.offchainResolver.OffchainUserProfile,
    ): Promise<boolean>;
}
