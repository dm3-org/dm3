import {
    IpfsResolver,
    JsonResolver,
    LinkResolver,
    ProfileResolver,
    SignedUserProfile,
    validateSignedUserProfile,
} from 'dm3-lib-account';
import { log } from 'dm3-lib-shared';
import { getEnsTextRecord } from '../external-apis/InjectedWeb3API';
import { getUserProfileOffChain } from '../external-apis/BackendAPI';
import axios from 'axios';
/**
 * fetch a dm3 user profile
 * @param connection dm3 connection object
 * @param contact The Ethereum account address of the of the profile owner
 * @param getProfileOffChain Function to fetch offchain user profiles
 * @param getEnsTextRecord Function to fetch ENS text records
 * @param getRessource Function to fetch a user profile
 * @param profileUrl Offchain user profile URL
 */
export const PROFILE_RECORD_NAME = 'network.dm3.profile';

export async function getUserProfile(
    connection: any,
    contact: string,
    profileUrl?: string,
): Promise<SignedUserProfile | undefined> {
    const getResource = async (uri: string) => (await axios.get(uri)).data;
    const textRecord = await getEnsTextRecord(
        connection.provider!,
        contact,
        PROFILE_RECORD_NAME,
    );
    //The user has no dm3-Profile text record set. Hence we need to fetch the profile offChain
    if (!textRecord) {
        log(`[getUserProfile] Offchain`);
        return getUserProfileOffChain(
            connection,
            connection.account,
            contact,
            profileUrl,
        );
    }
    /**
     * The Text record can contain either
     * * a link to the profile stored on a http server
     * * a link to the profile stored on ipfs
     * * The stringified profile
     */

    const resolver: ProfileResolver<SignedUserProfile>[] = [
        LinkResolver(getResource, validateSignedUserProfile),
        IpfsResolver(getResource, validateSignedUserProfile),
        JsonResolver(validateSignedUserProfile),
    ];

    return await resolver
        .find((r) => r.isProfile(textRecord))
        ?.resolveProfile(textRecord);
}
