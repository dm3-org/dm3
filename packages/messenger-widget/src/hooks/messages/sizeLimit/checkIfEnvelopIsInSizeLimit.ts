import { EncryptionEnvelop, getEnvelopSize } from '@dm3-org/dm3-lib-messaging';
import { log } from '@dm3-org/dm3-lib-shared';
import { ethers } from 'ethers';
import { ContactPreview } from '../../../interfaces/utils';
import { closeErrorModal, openErrorModal } from '../../../utils/common-utils';
import { fetchMessageSizeLimit } from './fetchSizeLimit';

export const checkIfEnvelopIsInSizeLimit = async (
    mainnetProvider: ethers.providers.JsonRpcProvider,
    recipient: ContactPreview,
    encryptedEnvelop: EncryptionEnvelop,
): Promise<boolean> => {
    const account = recipient.contactDetails.account;

    try {
        const reciversSizeLimit = await fetchMessageSizeLimit(
            mainnetProvider,
            account,
        );

        const envelopSize = getEnvelopSize(encryptedEnvelop);

        if (envelopSize > reciversSizeLimit) {
            openErrorModal(
                'The size of the message is larger than limit '
                    .concat(reciversSizeLimit.toString(), ' bytes. ')
                    .concat('Please reduce the message size.'),
                false,
                closeErrorModal,
            );

            return false;
        }
        return true;
    } catch (error) {
        log(error, 'message size limit');
        return true;
    }
};
