import { ethers } from 'ethers';

import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import { mockDeliveryServiceProfile } from '../../../billboard-client/test/helper/mockDeliveryServiceProfile';
import { createLspFromRandomWallet } from './index';

describe('LimitedScopeProfile', () => {
    let ds1: any;
    describe('Defaut auth', () => {
        it('creates new lsp for owner', async () => {
            const deliveryServiceUrl = 'http://ds.dm3.io';
            const offchainResolverUrl = 'http://resolver.dm3.io';
            const deliveryServiceEnsName = 'ds1.dm3.eth';

            const axiosMock = new MockAdapter(axios);

            const ownerWallet = ethers.Wallet.createRandom();

            axiosMock.onPost().reply(200, 'token');

            axiosMock
                .onPost(`${offchainResolverUrl}/profile/address`)
                .reply(200);

            ds1 = await mockDeliveryServiceProfile(
                ethers.Wallet.createRandom(),
                deliveryServiceUrl,
            );

            const mockProvider = {
                send: (method: string, [msg, acc]: any[]) => {
                    if (method === 'personal_sign') {
                        return ownerWallet.signMessage(msg);
                    }
                    throw new Error('Method not implemented.');
                },
                getResolver: (ensName: string) => {
                    return {
                        getText: (record: string) => {
                            return ds1.stringified;
                        },
                    } as unknown as ethers.providers.Resolver;
                },
            } as unknown as ethers.providers.JsonRpcProvider;

            const { lsp } = await createLspFromRandomWallet(
                mockProvider,
                offchainResolverUrl,
                deliveryServiceEnsName,
                'gashawk',
                ownerWallet.address,
            );

            expect(lsp).toEqual({
                ensName: `lsp.${ownerWallet.address}.gashawk.dm3.eth`,
                keys: {
                    encryptionKeyPair: expect.anything(),
                    signingKeyPair: expect.anything(),
                    storageEncryptionKey: expect.anything(),
                    storageEncryptionNonce: expect.anything(),
                },
                token: 'token',
                deliveryServiceUrl: 'http://ds.dm3.io',
            });
        });
        it('throws if personal sign was rejected', async () => {
            const deliveryServiceUrl = 'http://ds.dm3.io';
            const offchainResolverUrl = 'http://resolver.dm3.io';
            const deliveryServiceEnsName = 'ds1.dm3.eth';

            const axiosMock = new MockAdapter(axios);

            const ownerWallet = ethers.Wallet.createRandom();

            axiosMock.onPost().reply(200, 'token');

            axiosMock
                .onPost(`${offchainResolverUrl}/profile/address`)
                .reply(200);

            ds1 = await mockDeliveryServiceProfile(
                ethers.Wallet.createRandom(),
                deliveryServiceUrl,
            );

            const mockProvider = {
                send: (method: string, [msg, acc]: any[]) => {
                    if (method === 'personal_sign') {
                        throw new Error('');
                    }
                    throw new Error('Method not implemented.');
                },
                getResolver: (ensName: string) => {
                    return {
                        getText: (record: string) => {
                            return ds1.stringified;
                        },
                    } as unknown as ethers.providers.Resolver;
                },
            } as unknown as ethers.providers.JsonRpcProvider;

            await expect(
                createLspFromRandomWallet(
                    mockProvider,
                    offchainResolverUrl,
                    deliveryServiceEnsName,
                    'gashawk',
                    ownerWallet.address,
                ),
            ).rejects.toThrow();
        });
        it('throws if sig does not match ownerAddress', async () => {
            const deliveryServiceUrl = 'http://ds.dm3.io';
            const offchainResolverUrl = 'http://resolver.dm3.io';
            const deliveryServiceEnsName = 'ds1.dm3.eth';

            const axiosMock = new MockAdapter(axios);

            const ownerWallet = ethers.Wallet.createRandom();

            axiosMock.onPost().reply(200, 'token');

            axiosMock
                .onPost(`${offchainResolverUrl}/profile/address`)
                .reply(200);

            ds1 = await mockDeliveryServiceProfile(
                ethers.Wallet.createRandom(),
                deliveryServiceUrl,
            );

            const mockProvider = {
                send: (method: string, [msg, acc]: any[]) => {
                    if (method === 'personal_sign') {
                        return ethers.Wallet.createRandom().signMessage(msg);
                    }
                    throw new Error('Method not implemented.');
                },
                getResolver: (ensName: string) => {
                    return {
                        getText: (record: string) => {
                            return ds1.stringified;
                        },
                    } as unknown as ethers.providers.Resolver;
                },
            } as unknown as ethers.providers.JsonRpcProvider;

            await expect(
                createLspFromRandomWallet(
                    mockProvider,
                    offchainResolverUrl,
                    deliveryServiceEnsName,
                    'gashawk',
                    ownerWallet.address,
                ),
            ).rejects.toThrow();
        });
    });
});
