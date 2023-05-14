import { log } from 'dm3-lib-shared';
import { getChallenge } from '../../../api/internal/rest/getChallenge';
import { getNewToken } from '../../../api/internal/rest/getNewToken';
import {
    BillboardWithDsProfile,
    AuthenticatedBillboard,
} from '../DsManagerImpl';
import { sign } from 'dm3-lib-crypto';

/**
 * Sign in at the delivery service for each billboard in the given array.
 *
 * @param billboardsWithDsProfile - Array of billboards with their respective delivery service profiles.
 * @returns Promise that resolves to an array of authenticated billboards.
 */
export async function signInAtDs(
    billboardsWithDsProfile: BillboardWithDsProfile[],
): Promise<AuthenticatedBillboard[]> {
    return await Promise.all(
        billboardsWithDsProfile.map(async (billboard) => {
            const { ensName, profileKeys, dsProfile } = billboard;
            //Get the auth token for each delivery service. By doing the challenge using the billboards private key
            const tokens = await Promise.all(
                dsProfile.map(async (ds) => {
                    log(
                        `Create session for ${billboard.ensName} at ${ds.url}}`,
                    );
                    //Create session using the billboards private key
                    const challenge = await getChallenge(ds.url, ensName);
                    if (!challenge) {
                        throw Error('No challenge received from ' + ds.url);
                    }
                    const signature = await sign(
                        profileKeys.signingKeyPair.privateKey,
                        challenge,
                    );

                    const token = await getNewToken(ds.url, ensName, signature);
                    log('get token for ' + ds.url);
                    if (!token) {
                        throw Error("Can't create session for " + ds.url);
                    }
                    return token;
                }),
            );
            return {
                ...billboard,
                dsProfile: tokens.map((token, idx) => ({
                    ...billboard.dsProfile[idx],
                    token,
                })),
            };
        }),
    );
}
