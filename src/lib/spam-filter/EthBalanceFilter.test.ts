import { ethers } from 'ethers';
import { ethBalanceFilter } from './EthBalanceFilter';

const message = {
    message: {
        from: '',
        to: '',
        message: 'test',
        timestamp: 0,
    },
    signature: '',
};

test('Should accept a message with an eth balance equal the threshold', async () => {
    expect.assertions(1);

    await expect(
        ethBalanceFilter(
            message,
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
            message,
            {
                ethHigherOrEqualThan: '2',
            },
            async () => ethers.BigNumber.from('1'),
        ),
    ).resolves.toStrictEqual(false);
});
