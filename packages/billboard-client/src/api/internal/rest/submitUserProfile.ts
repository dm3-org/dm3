import axios from 'axios';
import { SignedUserProfile, normalizeEnsName } from 'dm3-lib-profile';
import { log } from 'dm3-lib-shared';

export async function submitUserProfile(
    dsUrl: string,
    ensName: string,
    signedUserProfile: SignedUserProfile,
): Promise<string | null> {
    const url = `${dsUrl}/profile/${normalizeEnsName(ensName)}`;

    try {
        const { data } = await axios.post(url, signedUserProfile);
        return data;
    } catch (e) {
        log(
            "can't submit userProfile to ds " + dsUrl + ' ' + JSON.stringify(e),
            'error',
        );
        return null;
    }
}
