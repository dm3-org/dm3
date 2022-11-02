import { ethers } from 'ethers';
import { Envelop } from '../messaging';

import { Filter, filter } from './';

const envelops: Envelop[] = [
    {
        message: {
            from: '0x1',
            to: '',
            message: 'test0',
            timestamp: 0,
            type: 'NEW',
            signature: '',
        },
        signature: '',
    },
    {
        message: {
            from: '0x2',
            to: '',
            message: 'test1',
            timestamp: 0,
            type: 'NEW',
            signature: '',
        },
        signature: '',
    },
    {
        message: {
            from: '0x3',
            to: '',
            message: 'test12',
            timestamp: 0,
            type: 'NEW',
            signature: '',
        },
        signature: '',
    },
];

const connection = {
    provider: {
        getTransactionCount: async (from: string) => {
            switch (from) {
                case '0x1':
                    return 1;
                case '0x2':
                    return 0;
                case '0x3':
                    return 2;
                default:
                    return 0;
            }
        },
        getBalance: async (from: string) => {
            switch (from) {
                case '0x1':
                    return ethers.BigNumber.from('1');
                case '0x2':
                    return ethers.BigNumber.from('0');
                case '0x3':
                    return ethers.BigNumber.from('1');
                default:
                    return ethers.BigNumber.from('0');
            }
        },
    },
} as any;

test('Should use filter correctly with one filter criteria', async () => {
    expect.assertions(1);

    await expect(
        filter(
            [
                {
                    filter: Filter.EthBalanceFilter,
                    settings: {
                        ethHigherOrEqualThan: '1',
                    },
                },
            ],
            envelops,
            connection,
        ),
    ).resolves.toStrictEqual([envelops[0], envelops[2]]);
});

test('Should use filter correctly with two filter criteria', async () => {
    expect.assertions(1);

    await expect(
        filter(
            [
                {
                    filter: Filter.EthBalanceFilter,
                    settings: {
                        ethHigherOrEqualThan: '1',
                    },
                },
                {
                    filter: Filter.NonceFilter,
                    settings: {
                        nonceHigherOrEqualThan: 2,
                    },
                },
            ],
            envelops,
            connection,
        ),
    ).resolves.toStrictEqual([envelops[2]]);
});
