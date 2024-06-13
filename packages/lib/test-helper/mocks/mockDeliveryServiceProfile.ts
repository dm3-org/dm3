import {
    DeliveryServiceProfile,
    DeliveryServiceProfileKeys,
    createDeliveryServiceProfile,
} from '@dm3-org/dm3-lib-profile';
import { ethers } from 'ethers';

export type MockDeliveryServiceProfile = {
    address: string;
    wallet: ethers.Wallet;
    deliveryServiceProfile: DeliveryServiceProfile;
    keys: DeliveryServiceProfileKeys;
    stringified: string;
};

export const getMockDeliveryServiceProfile = async (
    wallet: ethers.Wallet,
    url: string,
): Promise<MockDeliveryServiceProfile> => {
    const { deliveryServiceProfile, keys } = await createDeliveryServiceProfile(
        url,
    );

    return {
        wallet,
        address: wallet.address,
        deliveryServiceProfile,
        keys,
        stringified:
            'data:application/json,' +
            JSON.stringify({
                ...deliveryServiceProfile,
            }),
    };
};
