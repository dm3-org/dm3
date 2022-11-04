import axios, { AxiosError } from 'axios';
import { assert } from 'console';
import { ethers } from 'ethers';
import { UserProfile } from '../account/Account';
import { Connection } from '../web3-provider/Web3Provider';
import {
    DeliveryServiceProfile,
    getDeliveryServiceClient,
    getDeliveryServiceProfile,
} from './Delivery';
import MockAdapter from 'axios-mock-adapter';

describe('Delivery', () => {
    let axiosMock: MockAdapter;

    beforeAll(() => {
        axiosMock = new MockAdapter(axios);
    });

    afterEach(() => {
        axiosMock.reset();
    });
    describe('getDeliveryServiceProfile', () => {
        test('throws Exception if ENS name is invalid', async () => {
            const deliveryServices = ['blabla'];

            const mockGetEnsResolver = (_: string) => Promise.resolve(null);

            const provider = {
                getResolver: mockGetEnsResolver,
            } as ethers.providers.BaseProvider;

            try {
                await getDeliveryServiceProfile(
                    deliveryServices[0],
                    { provider } as Connection,
                    (_: string) => Promise.resolve(undefined),
                );
                fail();
            } catch (e) {
                expect(e).toBe('Unknown ENS name');
            }
        });

        test('returns undefined TextRecord is not a valid dm3Profile', async () => {
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
                deliveryServices[0],
                { provider } as Connection,
                (_: string) => Promise.resolve(undefined),
            );
            expect(profile).toBeUndefined();
        });
        test('Resolves Json Profile', async () => {
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
                deliveryServices[0],
                { provider } as Connection,
                (_: string) => Promise.resolve(undefined),
            );

            expect(receivedProfile).toStrictEqual(receivedProfile);
        });
    });

    describe('getDeliveryServiceClient', () => {
        test('throws exception if no deliveryServiceName was specifed ', async () => {
            const profile = { deliveryServices: [] as string[] } as UserProfile;
            const mockGetEnsResolver = (_: string) => Promise.resolve(null);

            const provider = {
                getResolver: mockGetEnsResolver,
            } as ethers.providers.BaseProvider;

            try {
                await getDeliveryServiceClient(
                    profile,
                    { provider } as Connection,
                    (_: string) => Promise.resolve(undefined),
                );
                fail();
            } catch (e) {
                expect(e).toBe('Unknown ENS name');
            }
        });

        // eslint-disable-next-line max-len
        test('getDeliveryServiceClient -- return axios error if one deliveryService fails and no other is left ', async () => {
            const userProfile = {
                deliveryServices: ['blabla.ens'] as string[],
            } as UserProfile;

            const deliveryServiceProfile = {
                publicSigningKey: '1',
                publicEncryptionKey: '2',
                url: 'http://blabla.io',
            } as DeliveryServiceProfile;

            const mockGetEnsResolver = (_: string) =>
                Promise.resolve({
                    getText: (_: string) =>
                        Promise.resolve(JSON.stringify(deliveryServiceProfile)),
                } as unknown);

            const provider = {
                getResolver: mockGetEnsResolver,
            } as ethers.providers.BaseProvider;

            try {
                axiosMock.onGet('/foo').reply(400);

                const axiosInstance = await getDeliveryServiceClient(
                    userProfile,
                    { provider } as Connection,
                    (_: string) => Promise.resolve(undefined),
                );

                const res = await axiosInstance.get('/foo');
                fail();
            } catch (e) {
                const err = e as AxiosError;
                expect(err.message).toBe('Request failed with status code 400');
            }
        });
    });
});
