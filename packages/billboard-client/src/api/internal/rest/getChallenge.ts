import axios from 'axios';
import { normalizeEnsName } from 'dm3-lib-profile';
import { log } from 'dm3-lib-shared';

export async function getChallenge(
    dsUrl: string,
    ensName: string,
): Promise<string | null> {
    const url = `${dsUrl}/auth/${normalizeEnsName(ensName)}`;

    try {
        const { data } = await axios.get(url);
        return data.challenge;
    } catch (e) {
        log("can't get challenge from ds " + dsUrl);
        return null;
    }
}
