import * as Lib from 'dm3-lib';

/**
 * fetch a dm3 user profile
 * @param connection dm3 connection object
 * @param contact The Ethereum account address of the of the profile owner
 * @param getProfileOffChain Function to fetch offchain user profiles
 * @param getEnsTextRecord Function to fetch ENS text records
 * @param getRessource Function to fetch a user profile
 * @param profileUrl Offchain user profile URL
 */

export async function getUserProfile(
    connection: Lib.Connection,
    contact: string,
    profileUrl?: string,
): Promise<Lib.SignedUserProfile | undefined> {
    const textRecord = await Lib.external.getEnsTextRecord(
        connection.provider!,
        contact,
        Lib.account.PROFILE_RECORD_NAME,
    );
    //The user has no dm3-Profile text record set. Hence we need to fetch the profile offChain
    if (!textRecord) {
        Lib.shared.log(`[getUserProfile] Offchain`);
        return Lib.external.getProfileOffChain(
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

    const resolver: Lib.account.ProfileResolver<Lib.account.SignedUserProfile>[] =
        [
            Lib.account.LinkResolver(
                Lib.external.getRessource,
                Lib.account.validateSignedUserProfile,
            ),
            Lib.account.IpfsResolver(
                Lib.external.getRessource,
                Lib.account.validateSignedUserProfile,
            ),
            Lib.account.JsonResolver(Lib.account.validateSignedUserProfile),
        ];

    return await resolver
        .find((r) => r.isProfile(textRecord))
        ?.resolveProfile(textRecord);
}
