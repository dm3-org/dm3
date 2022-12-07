import { ethers } from 'ethers';
import { FilterFactory } from '..';
import { DeliveryInformation } from '../../messaging';
import { Rules } from '../SpamFilterRules';
import { SpamFilter } from './SpamFilter';

export type NonceFilterSettings = number;

export function nonceFilter(
    getNonce: (address: string) => Promise<number>,
    settings: NonceFilterSettings,
): SpamFilter {
    const filter = async ({ from }: DeliveryInformation) => {
        return (await getNonce(from)) >= settings;
    };

    return { filter };
}

export function nonceFilterFactory(): FilterFactory {
    const ID = Rules.MIN_NONCE;
    const getId = () => ID;

    const getFilter = (
        provider: ethers.providers.BaseProvider,
        settings: any,
    ) =>
        nonceFilter(
            provider.getTransactionCount,
            settings as NonceFilterSettings,
        );

    return { getId, getFilter };
}
