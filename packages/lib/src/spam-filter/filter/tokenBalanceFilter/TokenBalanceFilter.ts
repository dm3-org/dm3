import { BigNumber, ethers } from 'ethers';
import { DeliveryInformation } from '../../../messaging';
import { log } from '../../../shared/log';
import { SpamFilterRule } from '../../SpamFilterRules';
import { SpamFilterFactory } from '../SpamFilter';
import ERC20Abi from './Erc20Abi.json';

export type TokenBalanceFilterSettings = {
    address: string;
    amount: string;
};

export function tokenBalanceFilter(
    getTokenBalance: (tokenAddress: string, from: string) => Promise<BigNumber>,
    settings: TokenBalanceFilterSettings,
) {
    const filter = async ({ from }: DeliveryInformation) => {
        const { amount, address } = settings;
        //When we build a method

        const balance = await getTokenBalance(address, from);

        return balance.gte(BigNumber.from(amount));
    };

    return { filter };
}
export function tokenBalanceFilterFactory(): SpamFilterFactory {
    const ID = SpamFilterRule.MIN_TOKEN_BALANCE;

    const getTokenBalance =
        (provider: ethers.providers.BaseProvider) =>
        async (tokenAddress: string, from: string) => {
            try {
                const contract = new ethers.Contract(
                    tokenAddress,
                    ERC20Abi,
                    provider,
                );
                const balanceOfHex = await contract.balanceOf(from);
                return BigNumber.from(balanceOfHex);
            } catch (err) {
                log(
                    '[Token Balance Filter] Cant fetch balance from ERC20 Token. Return 0 as default' +
                        err,
                );
                return ethers.constants.Zero;
            }
        };
    const getId = () => ID;

    const getFilter = (
        provider: ethers.providers.BaseProvider,
        settings: any,
    ) => {
        return tokenBalanceFilter(
            getTokenBalance(provider),
            settings as TokenBalanceFilterSettings,
        );
    };

    return { getId, getFilter };
}
