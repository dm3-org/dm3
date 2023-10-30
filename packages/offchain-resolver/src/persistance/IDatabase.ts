import { SignedUserProfile } from 'dm3-lib-profile';
import { ProfileContainer } from './profile/getProfileContainer';

export interface IDatabase {
    getProfileAliasByAddress(address: string): Promise<string | null>;
    getProfileContainerByAddress(
        address: string,
    ): Promise<ProfileContainer | null>;
    getProfileContainer(address: string): Promise<ProfileContainer | null>;
    setUserProfile(
        ensName: string,
        offchainUserProfile: SignedUserProfile,
        address: string,
    ): Promise<boolean>;
    removeUserProfile(ensName: string): Promise<boolean>;
    setAlias(name: string, alias: string): Promise<boolean>;
    getProfileContainerForAlias(
        alias: string,
    ): Promise<ProfileContainer | null>;
}
