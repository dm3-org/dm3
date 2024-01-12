import axios from 'axios';
import { SignedUserProfile, normalizeEnsName } from '@dm3-org/dm3-lib-profile';
import { logError } from '@dm3-org/dm3-lib-shared';

export async function submitUserProfile(
    dsUrl: string,
    ensName: string,
    signedUserProfile: SignedUserProfile,
): Promise<string | null> {
    const url = `${dsUrl}/profile/${normalizeEnsName(ensName)}`;

    try {
        const { data } = await axios.post(url, signedUserProfile);
        return data;
    } catch (error) {
        logError({ text: "can't submit userProfile to ds ", dsUrl, error });
        return null;
    }
}
