import { ethers } from 'ethers';
import { DeliveryInformation } from '../../messaging';
import { SpamFilterRule } from '../SpamFilterRules';

//Filter an
export interface SpamFilter {
    filter(e: DeliveryInformation): Promise<boolean>;
}

//This interface can be used to create an SpamFilter that is capable of handeling a particular rule
export interface SpamFilterFactory {
    getId: () => SpamFilterRule;
    getFilter: (
        provider: ethers.providers.BaseProvider,
        settings: any,
    ) => SpamFilter;
}
