import { ethers } from 'ethers';
import { Envelop } from '../messaging/Messaging';
import { nonceFilter } from './NonceFilter';

const envelop: Envelop = {
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

test('Should accept a message with a nonce equal the nonce threshold', async () => {
    expect.assertions(1);
    const getNonce = async (): Promise<number> =>
        new Promise((resolve) => resolve(1));

    await expect(
        nonceFilter(
            envelop,
            {
                nonceHigherOrEqualThan: 1,
            },
            getNonce,
        ),
    ).resolves.toStrictEqual(true);
});

test('Should reject a message with a nonce lower than the nonce threshold', async () => {
    expect.assertions(1);
    const getNonce = async (): Promise<number> =>
        new Promise((resolve) => resolve(1));

    await expect(
        nonceFilter(
            envelop,
            {
                nonceHigherOrEqualThan: 2,
            },
            getNonce,
        ),
    ).resolves.toStrictEqual(false);
});
