import {
    getPendingConversations,
    getUserProfileOffChain,
} from '../external-apis/BackendAPI';
import {
    getConractInstance,
    getEnsTextRecord,
    getResolver,
} from '../external-apis/InjectedWeb3API';
import { UserDB } from '../storage';
import { Connection } from '../web3-provider/Web3Provider';
import {
    addContact as execAddContact,
    getContacts as execGetContacts,
    getUserProfile as execGetUserProfile,
    getPublishProfileOnchainTransaction as execGetPublishProfileOnchainTransaction,
    SignedUserProfile,
} from './Account';
import axios from 'axios';

export {
    getAccountDisplayName,
    getBrowserStorageKey,
    checkStringSignature,
    getProfileCreationMessage,
    normalizeEnsName,
    checkUserProfile,
    checkUserProfileWithAddress,
    isSameEnsName,
    PROFILE_RECORD_NAME,
} from './Account';

export type {
    Account,
    ProfileKeys,
    UserProfile,
    SignedUserProfile,
} from './Account';

export type { ProfileExtension } from './profileExtension';

/**
 * add a contact by creating an empty converation with that contact
 *
 * @param ensName The ENS name of the contact
 * @param userDb User storage database
 * @param createEmptyConversationEntry Function to create an empty conversation
 */
export async function addContact(
    ensName: string,
    userDb: UserDB,
    createEmptyConversationEntry: (id: string) => void,
) {
    return execAddContact(ensName, userDb, createEmptyConversationEntry);
}

/**
 * returns all accounts based on existing conversations
 *
 * @param connection dm3 connection object
 * @param deliveryServiceToken Delivery service authentication token
 * @param userDb User storage database
 * @param createEmptyConversationEntry Function to create an empty conversation
 * @param alias Alias ENS name
 */
export async function getContacts(
    connection: Connection,
    userDb: UserDB,
    deliveryServiceToken: string,
    createEmptyConversationEntry: (id: string) => void,
) {
    return execGetContacts(
        connection,
        deliveryServiceToken,
        getUserProfile,
        getPendingConversations,
        userDb,
        createEmptyConversationEntry,
    );
}

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

export * as schema from './schema';
