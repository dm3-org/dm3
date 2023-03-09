import axios from 'axios';
import { getUserProfileOffChain } from '../../external-apis/BackendAPI';
import {
    getConractInstance,
    getEnsTextRecord,
    getResolver,
} from '../../external-apis/InjectedWeb3API';
import { Connection } from '../../web3-provider/Web3Provider';
import {
    getPublishProfileOnchainTransaction as execGetPublishProfileOnchainTransaction,
    getUserProfile as execGetUserProfile,
    SignedUserProfile,
} from './Account';

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

/**
 * creates the transaction object that can be used to publish the profile to a top level ens name
 * @param connection dm3 connection object
 * @param ensName The ENS the profile should be published to
 * @param ownProfile The profile that should be published
 */
export function getPublishProfileOnchainTransaction(
    connection: Connection,
    ensName: string,
) {
    return execGetPublishProfileOnchainTransaction(
        connection,
        ensName,
        getResolver,
        getConractInstance,
    );
}

/**
 * fetch a dm3 user profile
 *
 * @param connection dm3 connection object
 * @param contact The Ethereum account address of the of the profile owner
 * @param profileUrl Offchain user profile URL
 */
export function getUserProfile(
    connection: Connection,
    contact: string,
    profileUrl?: string,
): Promise<SignedUserProfile | undefined> {
    return execGetUserProfile(
        connection,
        contact,
        getUserProfileOffChain,
        getEnsTextRecord,
        async (uri) => (await axios.get(uri)).data,
        profileUrl,
    );
}

export type GetUserProfile = typeof getUserProfile;
