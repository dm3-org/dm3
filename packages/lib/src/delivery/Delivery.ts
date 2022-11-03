import { ethers } from 'ethers';
import { GetResource, UserProfile } from '../account/Account';
import { IpfsResolver } from '../account/profileResolver/IpfsResolver';
import { DeliveryServiceResolver } from '../account/profileResolver/json/DeliveryServiceResolver';
import { UserProfileResolver } from '../account/profileResolver/json/UserProfileResolver';
import { LinkResolver } from '../account/profileResolver/LinkResolver';
import { ProfileResolver } from '../account/profileResolver/ProfileResolver';
import { Connection } from '../web3-provider/Web3Provider';

export interface DeliveryServiceProfile {
    publicSigningKey: string;
    publicEncryptionKey: string;
    url: string;
}

export async function getDeliveryServiceProfile(
    { deliveryServices }: UserProfile,
    { provider }: Connection,
    getRessource: GetResource<DeliveryServiceProfile>,
): Promise<DeliveryServiceProfile | undefined> {
    const DELIVERY_SERVICE_PROFILE_KEY = 'eth.dm3.deliveryService';
    const ensResolver = await provider?.getResolver(deliveryServices[0]);

    if (!ensResolver) {
        throw 'Unknown ENS name';
    }

    const textRecord = await ensResolver?.getText(DELIVERY_SERVICE_PROFILE_KEY);

    const resolver: ProfileResolver<DeliveryServiceProfile>[] = [
        LinkResolver(getRessource),
        IpfsResolver(getRessource),
        DeliveryServiceResolver(),
    ];

    const profile = await resolver
        .find((r) => r.isProfile(textRecord))
        ?.resolveProfile(textRecord);

    return profile;
}
