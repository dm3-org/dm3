import axios from 'axios';
import { SignedUserProfile } from 'dm3-lib-profile';

export async function claimAddress(
    address: string,
    offchainResolverUrl: string,
    signedUserProfile: SignedUserProfile,
) {
    const url = `${offchainResolverUrl}/profile/address`;
    const data = {
        signedUserProfile,
        address,
    };

    const { status } = await axios.post(url, data);
    return status === 200;
}
