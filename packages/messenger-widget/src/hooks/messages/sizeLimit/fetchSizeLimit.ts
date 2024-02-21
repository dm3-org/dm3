import { getDeliveryServiceProperties } from '@dm3-org/dm3-lib-delivery-api';
import { Account } from '@dm3-org/dm3-lib-profile';
import { ethers } from 'ethers';

export const fetchMessageSizeLimit = async (
    mainnetProvider: ethers.providers.StaticJsonRpcProvider,
    account: Account,
) => {
    const details = await getDeliveryServiceProperties(
        mainnetProvider as ethers.providers.JsonRpcProvider,
        account as Account,
    );
    return details.sizeLimit;
};
