import axios, { AxiosResponse } from 'axios';
import { EncryptionEnvelop } from '@dm3-org/dm3-lib-messaging';
import { logError } from '@dm3-org/dm3-lib-shared';

/**
 * Retrieves incoming messages for a specific ENS name.
 *
 * @param {string} ensName - The ENS name for which to retrieve incoming messages.
 * @returns {Promise<IncomingMessage[]>} - A promise that resolves with the array of incoming messages.
 */
export async function getIncomingMessages(
    dsUrl: string,
    ensName: string,
    token: string,
): Promise<EncryptionEnvelop[] | null> {
    try {
        const response: AxiosResponse<EncryptionEnvelop[]> = await axios.get(
            `${dsUrl}/delivery/messages/incoming/${ensName}`,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            },
        );

        return response.data;
    } catch (error) {
        logError({
            text: `Failed to retrieve incoming messages for ds`,
            dsUrl,
            error,
        });
        return null;
    }
}
