import { ethers } from 'ethers';
import { Envelop } from '../messaging/Messaging';
import { ethBalanceFilter } from './EthBalanceFilter';

const envelope: Envelop = {
    message: {
        from: '',
        to: '',
        message: 'test',
        timestamp: 0,
        type: 'NEW',
        signature: '',
    },
    signature: '',
};

test('Should accept a message with an eth balance equal the threshold', async () => {
    expect.assertions(1);

    await expect(
        ethBalanceFilter(
            envelope,
            {
                ethHigherOrEqualThan: '1',
            },
            async () => ethers.BigNumber.from('1'),
        ),
    ).resolves.toStrictEqual(true);
});

test('Should reject a message with an eth balance lower than the threshold', async () => {
    expect.assertions(1);
    await expect(
        ethBalanceFilter(
            envelope,
            {
                ethHigherOrEqualThan: '2',
            },
            async () => ethers.BigNumber.from('1'),
        ),
    ).resolves.toStrictEqual(false);
});
