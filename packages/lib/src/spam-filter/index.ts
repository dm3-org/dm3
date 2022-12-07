import { ethers, providers } from 'ethers';
import { Session } from '../delivery';
import { DeliveryInformation } from '../messaging/Messaging';
import {
    ethBalanceFilter,
    ethBalanceFilterFactory,
} from './filter/EthBalanceFilter';
import { nonceFilterFactory } from './filter/NonceFilter';
import { SpamFilter } from './filter/SpamFilter';
import { Rules } from './SpamFilterRules';

export interface FilterFactory {
    getId: () => Rules;
    getFilter: (
        provider: ethers.providers.BaseProvider,
        settings: any,
    ) => SpamFilter;
}

//Reduces many SpamFilters into one single Filter
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

export function getUsersSpamFilters(
    provider: ethers.providers.BaseProvider,
    { spamFilterRules }: Session,
) {
    //User has not defined any rules
    if (!spamFilterRules) {
        return [];
    }

    return [nonceFilterFactory(), ethBalanceFilterFactory()]
        .filter((f) => !!spamFilterRules[f.getId()])
        .map((f) => f.getFilter(provider, spamFilterRules[f.getId()]));
}

export async function isSpam(
    provider: ethers.providers.BaseProvider,
    session: Session,
    deliveryInformation: DeliveryInformation,
) {
    const usersSpamFilters = getUsersSpamFilters(provider, session);
    const filter = compileSpamFilter(usersSpamFilters);

    const isValid = await filter(deliveryInformation);

    return !isValid;
}
