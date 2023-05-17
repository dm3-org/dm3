import axios from 'axios';
import { SignedUserProfile } from 'dm3-lib-profile';

export function OffchainResolverClient(baseUrl: string) {
    async function claimSubdomain(
        signedUserProfile: SignedUserProfile,
        siweMessage: string,
        siweSig: string,
        hotAddr: string,
    ): Promise<boolean> {
        const url = `${baseUrl}/profile/nameP`;
        const data = {
            signedUserProfile,
            siweMessage,
            siweSig,
            hotAddr,
        };


        const { status } = await axios.post(url, data);
        return status === 200;
    }

    return { claimSubdomain };
}
