import { getDeliveryServiceProperties } from '@dm3-org/dm3-lib-delivery-api';
import { Account } from '@dm3-org/dm3-lib-profile';
import { log } from '@dm3-org/dm3-lib-shared';
import { ethers } from 'ethers';

export const fetchMessageSizeLimit = async (
    mainnetProvider: ethers.providers.StaticJsonRpcProvider,
    account: Account,
) => {
    try {
        const details = await getDeliveryServiceProperties(
            mainnetProvider as ethers.providers.JsonRpcProvider,
            account as Account,
        );
        return details.sizeLimit;
    } catch (error) {
        log('contact has no profile', 'info');
        return 0;
    }
};
