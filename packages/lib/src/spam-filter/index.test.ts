import { ethers } from 'ethers';
import { EncryptionEnvelop, Envelop } from '../messaging';

import { Filter, filter } from './';
import * as testData from './index.test.json';

const keysA = {
    encryptionKeyPair: {
        publicKey:
            '0x78798cab6f457a23ca7cd3e449cb4fb99197bd5d2c29e3bf299917da75ef320c',
        privateKey:
            '0xa4c23bec5db0dc62bea2664207803ad560ea21238e9d61974767ff3132dba9b6',
    },
    signingKeyPair: {
        publicKey:
            '0xfad90341665fbfd8b106639bb1ff2d8131d365a8f0004f66b93b450148f67bd2',
        privateKey:
            '0xf83a5e0630b32021688bbe37ff8ebac89ba7b07479e4186bdc69ea712e1cb895' +
            'fad90341665fbfd8b106639bb1ff2d8131d365a8f0004f66b93b450148f67bd2',
    },
    storageEncryptionKey:
        '0xf83a5e0630b32021688bbe37ff8ebac89ba7b07479e4186bdc69ea712e1cb895',
    storageEncryptionNonce: 0,
};

const connection = {
    provider: {
        getTransactionCount: async (from: string) => {
            switch (from) {
                case '0x25A643B6e52864d0eD816F1E43c0CF49C83B8292':
                    return 1;
                case '0xDd36ae7F9a8E34FACf1e110c6e9d37D0dc917855':
                    return 0;
                default:
                    return 0;
            }
        },
        getBalance: async (from: string) => {
            switch (from) {
                case '0x25A643B6e52864d0eD816F1E43c0CF49C83B8292':
                    return ethers.BigNumber.from('0');
                case '0xDd36ae7F9a8E34FACf1e110c6e9d37D0dc917855':
                    return ethers.BigNumber.from('1');
                default:
                    return ethers.BigNumber.from('0');
            }
        },
    },
} as any;

const envelops = [testData.envelopA, testData.envelopB] as EncryptionEnvelop[];

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
            keysA.encryptionKeyPair,
        ),
    ).resolves.toStrictEqual([envelops[1]]);
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
            keysA.encryptionKeyPair,
        ),
    ).resolves.toStrictEqual([]);
});
