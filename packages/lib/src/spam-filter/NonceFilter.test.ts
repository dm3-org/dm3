import { ethers } from 'ethers';
import { Envelop } from '../messaging/Messaging';
import { nonceFilter } from './NonceFilter';

test('Should accept a message with a nonce equal the nonce threshold', async () => {
    expect.assertions(1);
    const getNonce = async (): Promise<number> =>
        new Promise((resolve) => resolve(1));

    await expect(
        nonceFilter(
            '',
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
            '',
            {
                nonceHigherOrEqualThan: 2,
            },
            getNonce,
        ),
    ).resolves.toStrictEqual(false);
});
