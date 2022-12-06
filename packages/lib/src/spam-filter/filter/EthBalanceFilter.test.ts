import { ethers } from 'ethers';
import {
    DeliveryInformation,
    EncryptionEnvelop,
    Envelop,
} from '../../messaging/Messaging';
import { ethBalanceFilter } from './EthBalanceFilter';

test('Should accept a message with an eth balance equal the threshold', async () => {
    expect.assertions(1);

    const { filter } = ethBalanceFilter(
        async () => ethers.BigNumber.from('1'),
        {
            ethHigherOrEqualThan: '1',
        },
    );

    await expect(
        filter({ from: '' } as DeliveryInformation),
    ).resolves.toStrictEqual(true);
});

test('Should reject a message with an eth balance lower than the threshold', async () => {
    expect.assertions(1);
    const { filter } = ethBalanceFilter(
        async () => ethers.BigNumber.from('1'),
        {
            ethHigherOrEqualThan: '2',
        },
    );

    await expect(
        filter({ from: '' } as DeliveryInformation),
    ).resolves.toStrictEqual(false);
});
