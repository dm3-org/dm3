import { log } from 'dm3-lib-shared';
import { getChallenge } from '../../../api/internal/rest/getChallenge';
import { getNewToken } from '../../../api/internal/rest/getNewToken';
import {
    BillboardWithDsProfile,
    AuthenticatedBillboard,
} from '../DsManagerImpl';
import { sign } from 'dm3-lib-crypto';
import { UserProfile } from 'dm3-lib-profile';
import { submitUserProfile } from '../../../api/internal/rest/submitUserProfile';

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
                    {
                        // eslint-disable-next-line max-len
                        //If it's the very first time the billboard connects to the delivery service, we need to submit the profile first
                        const token = await submitUserProfile(
                            ds.url,
                            billboard.ensName,
                            {
                                profile: billboard.profile,
                                signature: billboard.signature,
                            },
                        );
                        // eslint-disable-next-line max-len
                        //If the profile was already submitted, we get a token back. Otherwise we've to perform the challenge response flow
                        if (token) {
                            log(
                                `Submitted profilte for ${billboard.ensName} to ${ds.url}}`,
                                'info',
                            );
                            return token;
                        }
                    }
                    log(
                        `Create session for ${billboard.ensName} at ${ds.url}}`,
                        'info',
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
                    log('get token for ' + ds.url, 'info');
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
