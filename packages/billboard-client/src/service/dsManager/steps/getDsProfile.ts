import { getDeliveryServiceProfile } from 'dm3-lib-profile';
import { BillboardWithProfile } from '../DsManagerImpl';
import { log } from 'dm3-lib-shared';
import { ethers } from 'ethers';

/**
Retrieves the profiles of delivery services for billboards.
@param provider - The JSON-RPC provider.
@returns An async function that takes a BillboardWithProfile object and returns a promise
that resolves with the updated object containing the delivery service profiles.
@throws If there is an error retrieving a delivery service profile.
*/
export function getDsProfile(provider: ethers.providers.JsonRpcProvider) {
    return async (billboardsWithProfile: BillboardWithProfile) => {
        const dsProfiles = await Promise.all(
            billboardsWithProfile.profile.deliveryServices.map(
                async (url: string) => {
                    log('Get DS profile for ' + url, 'info');
                    const dsProfile = await getDeliveryServiceProfile(
                        url,
                        provider,
                        //For now just JSON profiles hosted on ENS are supported.
                        //Hence we're not implementing the GetResource here
                        (url: string) => Promise.resolve(undefined),
                    );

                    if (!dsProfile) {
                        throw Error(
                            "Can't get delivery service profile for " + url,
                        );
                    }
                    return dsProfile;
                },
            ),
        );
        return { ...billboardsWithProfile, dsProfile: dsProfiles };
    };
}
