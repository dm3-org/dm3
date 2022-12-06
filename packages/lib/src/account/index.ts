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

export type { MutableProfileExtension } from './mutableProfileExtension';

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

export function publishProfileOnchain(connection: Connection, uri: string) {
    return execPublishProfileOnchain(
        connection,
        uri,
        lookupAddress,
        getResolver,
        getConractInstance,
        getUserProfileOffChain,
    );
}

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
