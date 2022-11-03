import { assert } from 'console';
import { ethers } from 'ethers';
import { UserProfile } from '../account/Account';
import { Connection } from '../web3-provider/Web3Provider';
import { DeliveryServiceProfile, getDeliveryServiceProfile } from './Delivery';

test('getDeliveryServiceProfile -- throws Exception if ENS name is invalid', async () => {
    const deliveryServices = ['blabla'];

    const mockGetEnsResolver = (_: string) => Promise.resolve(null);

    const provider = {
        getResolver: mockGetEnsResolver,
    } as ethers.providers.BaseProvider;

    try {
        await getDeliveryServiceProfile(
            { deliveryServices } as UserProfile,
            { provider } as Connection,
            (_: string) => Promise.resolve(undefined),
        );
        fail();
    } catch (e) {
        expect(e).toBe('Unknown ENS name');
    }
});

test('getDeliveryServiceProfile -- returns undefined TextRecord is not a valid dm3Profile', async () => {
    const deliveryServices = ['blabla'];

    const mockGetEnsResolver = (_: string) =>
        Promise.resolve({
            getText: (_: string) =>
                Promise.resolve(JSON.stringify({ foo: 'bar' })),
        } as unknown);

    const provider = {
        getResolver: mockGetEnsResolver,
    } as ethers.providers.BaseProvider;

    const profile = await getDeliveryServiceProfile(
        { deliveryServices } as UserProfile,
        { provider } as Connection,
        (_: string) => Promise.resolve(undefined),
    );
    expect(profile).toBeUndefined();
});
test('getDeliveryServiceProfile -- Resolves Json Profile', async () => {
    const expectedProfile = {
        publicSigningKey: '1',
        publicEncryptionKey: '2',
        url: 'http://localhost',
    } as DeliveryServiceProfile;
    const deliveryServices = ['dm3.eth'];

    const mockGetEnsResolver = (_: string) =>
        Promise.resolve({
            getText: (_: string) =>
                Promise.resolve(JSON.stringify(expectedProfile)),
        } as unknown);

    const provider = {
        getResolver: mockGetEnsResolver,
    } as ethers.providers.BaseProvider;

    const receivedProfile = await getDeliveryServiceProfile(
        { deliveryServices } as UserProfile,
        { provider } as Connection,
        (_: string) => Promise.resolve(undefined),
    );

    expect(receivedProfile).toStrictEqual(receivedProfile);
});
