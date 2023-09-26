import axios from 'axios';
import { normalizeEnsName } from 'dm3-lib-profile';
import { logInfo } from 'dm3-lib-shared';

export async function getLspFromResolver(
    baseUrl: string,
    appID: string,
    authMessage: string,
    ownerAddress: string,
    sig: string,
): Promise<{
    nonce: string;
    privateKey: string;
} | null> {
    const url = `${baseUrl}/lsp/${appID}/${normalizeEnsName(ownerAddress)}`;

    const data = {
        authMessage,
        sig,
    };

    try {
        const response = await axios.post(url, data);
        const { nonce, privateKey } = response.data;
        return { nonce, privateKey };
    } catch (e) {
        logInfo('lsp not found');
        return null;
    }
}
