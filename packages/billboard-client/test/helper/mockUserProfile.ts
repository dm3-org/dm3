import {
    SignedUserProfile,
    Account,
    UserProfile,
    getProfileCreationMessage,
    DeliveryServiceProfile,
} from 'dm3-lib-profile';
import { stringify } from 'dm3-lib-shared';
import { ethers } from 'ethers';

export const mockUserProfile = async (
    wallet: ethers.Wallet,
    ensName: string,
    deliveryServices: string[],
): Promise<{
    address: string;
    signedUserProfile: SignedUserProfile;
    account: Account;
    wallet: ethers.Wallet;
    stringified: string;
}> => {
    const profile: UserProfile = {
        publicSigningKey: '0ekgI3CBw2iXNXudRdBQHiOaMpG9bvq9Jse26dButug=',
        publicEncryptionKey: 'Vrd/eTAk/jZb/w5L408yDjOO5upNFDGdt0lyWRjfBEk=',
        deliveryServices,
    };

    const createUserProfileMessage = getProfileCreationMessage(
        stringify(profile),
    );
    const signature = await wallet.signMessage(createUserProfileMessage);

    return {
        wallet,
        address: wallet.address,
        account: {
            ensName: 'bob.eth',
            profile,
            profileSignature: signature,
        },
        signedUserProfile: {
            profile,
            signature,
        },
        stringified:
            'data:application/json,' +
            JSON.stringify({
                profile,
                signature,
            }),
    };
};
