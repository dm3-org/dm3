import { EncryptionEnvelop, getEnvelopSize } from '@dm3-org/dm3-lib-messaging';

export const checkIfEnvelopAreInSizeLimit = async (
    encryptedEnvelops: EncryptionEnvelop[],
    receiversMessageSizeLimit: number,
): Promise<boolean> => {
    try {
        const atLeastOneEnvelopIsToLarge = !!encryptedEnvelops
            //get the size of each envelop
            .map((encryptedEnvelop) => getEnvelopSize(encryptedEnvelop))
            //If any of the envelops is bigger than the receivers message size limit, return false
            .find((envelopSize) => {
                return envelopSize > receiversMessageSizeLimit;
            });

        //If no envelop is to large, return true
        return !atLeastOneEnvelopIsToLarge;
    } catch (error) {
        console.error('Error in checkIfEnvelopAreInSizeLimit', error);
        return false;
    }
};
