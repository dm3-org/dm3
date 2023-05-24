import axios from 'axios';
import { normalizeEnsName } from 'dm3-lib-profile';
import { log } from 'dm3-lib-shared';

export async function getNewToken(
    dsUrl: string,
    ensName: string,
    signature: string,
): Promise<string | null> {
    const url = `${dsUrl}/auth/${normalizeEnsName(ensName)}`;
    try {
        const { data } = await axios.post(url, { signature });
        return data.token;
    } catch (e) {
        log("can't get new token from ds: " + JSON.stringify(e), 'error');
        return null;
    }
}
