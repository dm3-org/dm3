import { DeliveryServiceProfile } from 'dm3-lib-profile';
import { ethers } from 'ethers';

export const mockDeliveryServiceProfile = async (
    wallet: ethers.Wallet,
    url: string,
): Promise<{
    address: string;

    wallet: ethers.Wallet;
    stringified: string;
}> => {
    const profile: DeliveryServiceProfile = {
        publicSigningKey: '0ekgI3CBw2iXNXudRdBQHiOaMpG9bvq9Jse26dButug=',
        publicEncryptionKey: 'Vrd/eTAk/jZb/w5L408yDjOO5upNFDGdt0lyWRjfBEk=',
        url,
    };

    return {
        wallet,
        address: wallet.address,

        stringified:
            'data:application/json,' +
            JSON.stringify({
                ...profile,
            }),
    };
};
