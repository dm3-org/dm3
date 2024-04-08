import { EncryptionEnvelop, getEnvelopSize } from '@dm3-org/dm3-lib-messaging';
import { log } from '@dm3-org/dm3-lib-shared';

export const checkIfEnvelopIsInSizeLimit = async (
    encryptedEnvelop: EncryptionEnvelop,
    receiversMessageSizeLimit: number,
): Promise<boolean> => {
    try {
        const envelopSize = getEnvelopSize(encryptedEnvelop);

        if (envelopSize > receiversMessageSizeLimit) {
            return false;
        }

        return true;
    } catch (error) {
        log(error, 'message size limit');
        return true;
    }
};
