import { ethers } from 'ethers';
import { DeliveryInformation } from '../../messaging';
import { SpamFilter } from './SpamFilter';

export interface EthBalanceFilterSettings {
    ethHigherOrEqualThan: string;
}

export function ethBalanceFilter(
    getEthBalance: (address: string) => Promise<ethers.BigNumber>,
    settings: EthBalanceFilterSettings,
): SpamFilter {
    const filter = async (e: DeliveryInformation) => {
        return (await getEthBalance(e.from)).gte(
            ethers.BigNumber.from(settings.ethHigherOrEqualThan),
        );
    };

    return { filter };
}
