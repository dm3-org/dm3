import axios from 'axios';
import { SignedUserProfile } from 'dm3-lib-profile';

export async function claimSubdomainForLsp(
    offchainResolverUrl: string,
    signedUserProfile: SignedUserProfile,
    authMessage: string,
    authSig: string,
    hotAddr: string,
): Promise<boolean> {
    const url = `${offchainResolverUrl}/profile/nameLsp`;
    const data = {
        signedUserProfile,
        authMessage,
        authSig,
        hotAddr,
    };

    const { status } = await axios.post(url, data);
    return status === 200;
}
