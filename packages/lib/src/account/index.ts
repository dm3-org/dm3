import {
    getPendingConversations,
    getUserProfileOffChain,
} from '../external-apis/BackendAPI';
import {
    getConractInstance,
    getEnsTextRecord,
    getResolver,
    lookupAddress,
    resolveName,
} from '../external-apis/InjectedWeb3API';
import { UserDB } from '../storage';
import { Connection } from '../web3-provider/Web3Provider';
import {
    addContact as execAddContact,
    getContacts as execGetContacts,
    getUserProfile as execGetUserProfile,
    publishProfileOnchain as execPublishProfileOnchain,
    SignedUserProfile,
} from './Account';
import axios from 'axios';

export {
    getAccountDisplayName,
    getBrowserStorageKey,
    checkStringSignature,
    getProfileCreationMessage,
} from './Account';

export type { Account, ProfileKeys, UserProfile } from './Account';

export type { ProfileExtension } from './profileExtension';

/**
 * add a contact by creating an empty converation with that contact
 *
 * @param connection dm3 connection object
 * @param accountInput Contact Etehereum account address
 * @param userDb User storage database
 * @param createEmptyConversationEntry Function to create an empty conversation
 */
export async function addContact(
    connection: Connection,
    accountInput: string,
    userDb: UserDB,
    createEmptyConversationEntry: (id: string) => void,
) {
    return execAddContact(
        connection,
        accountInput,
        resolveName,
        userDb,
        createEmptyConversationEntry,
    );
}

/**
 * returns all accounts based on existing conversations
 *
 * @param connection dm3 connection object
 * @param deliveryServiceToken Delivery service authentication token
 * @param userDb User storage database
 * @param createEmptyConversationEntry Function to create an empty conversation
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
        resolveName,
        userDb,
        createEmptyConversationEntry,
    );
}

/**
 * fetch a dm3 user profile
 *
 * @param connection dm3 connection object
 * @param url The URL pointing to the user profile
 */
export function publishProfileOnchain(connection: Connection, url: string) {
    return execPublishProfileOnchain(
        connection,
        url,
        lookupAddress,
        getResolver,
        getConractInstance,
        getUserProfileOffChain,
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
