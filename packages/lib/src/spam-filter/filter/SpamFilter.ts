/* eslint-disable max-len */
import { ethers } from 'ethers';
import { DeliveryInformation } from '../../messaging';
import { SpamFilterRule } from '../SpamFilterRules';

/**

 * A SpamFilter returns a function that can be used to determine wether the {@see DeliveryInformation} of a certain envelope is spam.
 */
export interface SpamFilter {
    filter(e: DeliveryInformation): Promise<boolean>;
}

/**
 * This interface can be used to create an {@see SpamFilter} that is capable of handeling a particular rule
 */
export interface SpamFilterFactory {
    getId: () => SpamFilterRule;
    getFilter: (
        provider: ethers.providers.BaseProvider,
        settings: any,
    ) => SpamFilter;
}
