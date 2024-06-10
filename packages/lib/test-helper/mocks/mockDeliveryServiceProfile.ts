import { DeliveryServiceProfile } from '@dm3-org/dm3-lib-profile';
import { ethers } from 'ethers';

export type MockDeliveryServiceProfile = {
    address: string;
    wallet: ethers.Wallet;
    profile: DeliveryServiceProfile;
    stringified: string;
};

export const getMockDeliveryServiceProfile = async (
    wallet: ethers.Wallet,
    url: string,
): Promise<MockDeliveryServiceProfile> => {
    const profile: DeliveryServiceProfile = {
        publicSigningKey: '0ekgI3CBw2iXNXudRdBQHiOaMpG9bvq9Jse26dButug=',
        publicEncryptionKey: 'Vrd/eTAk/jZb/w5L408yDjOO5upNFDGdt0lyWRjfBEk=',
        url,
    };

    return {
        wallet,
        address: wallet.address,
        profile,
        stringified:
            'data:application/json,' +
            JSON.stringify({
                ...profile,
            }),
    };
};
