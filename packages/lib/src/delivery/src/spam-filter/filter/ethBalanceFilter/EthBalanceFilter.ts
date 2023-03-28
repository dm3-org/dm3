import { DeliveryInformation } from 'dm3-lib-messaging';
import { ethers } from 'ethers';
import { SpamFilterRule } from '../../SpamFilterRules';
import { SpamFilter, SpamFilterFactory } from '../SpamFilter';

export type EthBalanceFilterSettings = string;

export function ethBalanceFilter(
    getEthBalance: (address: string) => Promise<ethers.BigNumber>,
    settings: EthBalanceFilterSettings,
): SpamFilter {
    const filter = async (e: DeliveryInformation) => {
        return (await getEthBalance(e.from)).gte(
            ethers.BigNumber.from(settings),
        );
    };

    return { filter };
}

export function ethBalanceFilterFactory(): SpamFilterFactory {
    const ID = SpamFilterRule.MIN_BALANCE;
    const getId = () => ID;

    const getFilter = (
        provider: ethers.providers.BaseProvider,
        settings: any,
    ) =>
        ethBalanceFilter(
            provider.getBalance,
            settings as EthBalanceFilterSettings,
        );

    return { getId, getFilter };
}
