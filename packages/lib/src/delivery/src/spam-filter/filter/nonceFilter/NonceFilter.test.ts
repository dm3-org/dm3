import { DeliveryInformation } from 'dm3-lib-messaging';
import { nonceFilter } from './NonceFilter';

test('Should accept a message with a nonce equal the nonce threshold', async () => {
    expect.assertions(1);
    const getNonce = async (): Promise<number> =>
        new Promise((resolve) => resolve(1));

    const { filter } = nonceFilter(getNonce, 1);

    await expect(
        filter({ from: '' } as DeliveryInformation),
    ).resolves.toStrictEqual(true);
});

test('Should reject a message with a nonce lower than the nonce threshold', async () => {
    expect.assertions(1);
    const getNonce = async (): Promise<number> =>
        new Promise((resolve) => resolve(1));

    const { filter } = nonceFilter(getNonce, 2);

    await expect(
        filter({ from: '' } as DeliveryInformation),
    ).resolves.toStrictEqual(false);
});
