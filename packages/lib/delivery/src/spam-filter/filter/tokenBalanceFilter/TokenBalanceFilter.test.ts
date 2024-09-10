import { DeliveryInformation } from '@dm3-org/dm3-lib-messaging';
import { BigNumber, ethers } from 'ethers';

import { tokenBalanceFilter } from './TokenBalanceFilter';

describe('tokenBalanceFilter', () => {
    it('Should reject a message with an token balance lower than the threshold', async () => {
        expect.assertions(1);

        const getBalance = (_: string, __: string) =>
            Promise.resolve(BigNumber.from(0));

        const { filter } = tokenBalanceFilter(getBalance, {
            address: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
            amount: '762400',
        });

        await expect(
            filter({ from: '' } as DeliveryInformation),
        ).resolves.toStrictEqual(false);
    });
    it('Should accept a message with an token balance higher than the threshold', async () => {
        expect.assertions(1);

        const getBalance = (_: string, __: string) =>
            Promise.resolve(BigNumber.from(200));

        const { filter } = tokenBalanceFilter(getBalance, {
            address: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
            amount: '100',
        });

        await expect(
            filter({ from: '' } as DeliveryInformation),
        ).resolves.toStrictEqual(true);
    });
});
