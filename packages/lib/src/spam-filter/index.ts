import { ethers } from 'ethers';
import { Session } from '../delivery';
import { DeliveryInformation } from '../messaging/Messaging';
import { ethBalanceFilterFactory } from './filter/EthBalanceFilter';
import { nonceFilterFactory } from './filter/NonceFilter';
import { SpamFilter } from './filter/SpamFilter';

/**
 * All spam filters that are currently implemented.
 * A new filter can easily be added by implementing the {@see SpamFilterFactory} interface
 */
const SUPPORTED_SPAM_FILTERS = [
    nonceFilterFactory(),
    ethBalanceFilterFactory(),
];

/**
 * Reduces many {@see SpamFilter} into one single filter function
 */
function compileSpamFilter(filter: SpamFilter[]) {
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
/**
 * Maps the {@see SpamFilterRules} a user has specified in they session to an array of filters
 */
function getUsersSpamFilters(
    provider: ethers.providers.BaseProvider,
    { spamFilterRules }: Session,
) {
    //User has not defined any rules
    if (!spamFilterRules) {
        return [];
    }

    return SUPPORTED_SPAM_FILTERS.filter(
        (f) => !!spamFilterRules[f.getId()],
    ).map((f) => f.getFilter(provider, spamFilterRules[f.getId()]));
}
/**
 * Tests if a envelope is spam based on its deliveryInformation. And the users preperences
 */
export async function isSpam(
    provider: ethers.providers.BaseProvider,
    session: Session,
    deliveryInformation: DeliveryInformation,
) {
    const usersSpamFilters = getUsersSpamFilters(provider, session);
    const filter = compileSpamFilter(usersSpamFilters);

    //The predicate of a filter returns true if the message is valid.
    const isValid = await filter(deliveryInformation);
    //Because the function returns wether a message isSpam we have to negate this value.
    return !isValid;
}
