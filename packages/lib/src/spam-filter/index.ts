import { DeliveryInformation } from '../messaging/Messaging';
import { SpamFilter } from './filter/SpamFilter';

export function compileSpamFilter(filter: SpamFilter[]) {
    return async (deliveryInformation: DeliveryInformation) => {
        const filterPromises = await Promise.all(
            filter.map((f) => f.filter(deliveryInformation)),
        );

        return filterPromises.reduce(
            (agg, cur) => (agg === false ? false : cur),
            true,
        );
    };
}

export function filterSpam() {}
