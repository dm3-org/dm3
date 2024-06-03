import { DeliveryServiceProperties } from '@dm3-org/dm3-lib-delivery';
import { log } from '@dm3-org/dm3-lib-shared';

export const fetchMessageSizeLimit = async (
    deliveryServiceProperties: DeliveryServiceProperties[],
) => {
    try {
        return deliveryServiceProperties[0].sizeLimit;
    } catch (error) {
        log('contact has no profile', 'info');
        return 0;
    }
};
