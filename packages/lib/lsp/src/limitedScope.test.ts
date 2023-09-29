import { ethers } from 'ethers';

import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import { mockDeliveryServiceProfile } from '../../../billboard-client/test/helper/mockDeliveryServiceProfile';
import { createLspFromDappSig } from './create/createLspFromDappSig';
import { createLspFromWalletSig } from './create/createLspFromWalletSig';
import { createKeyPairsFromSig } from 'dm3-lib-profile';
describe('LimitedScopeProfile', () => {
    let ds1: any;
    describe('user auth', () => {
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

            const lsp = await createLspFromWalletSig(
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
                nonce: expect.anything(),
                privateKey: expect.anything(),
            });
        });
        it('can recover profile with wallet privateKey', async () => {
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

            const lsp = await createLspFromWalletSig(
                mockProvider,
                offchainResolverUrl,
                deliveryServiceEnsName,
                'gashawk',
                ownerWallet.address,
            );

            const wallet = new ethers.Wallet(lsp.privateKey);

            //can recover profile with lspWallet pk and nonce
            const profile = await createKeyPairsFromSig(
                (msg: string) => wallet.signMessage(msg),
                lsp.nonce,
            );

            expect(profile).toEqual({
                encryptionKeyPair: lsp.keys.encryptionKeyPair,
                signingKeyPair: lsp.keys.signingKeyPair,
                storageEncryptionKey: lsp.keys.storageEncryptionKey,
                storageEncryptionNonce: lsp.keys.storageEncryptionNonce,
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
                createLspFromWalletSig(
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
                createLspFromWalletSig(
                    mockProvider,
                    offchainResolverUrl,
                    deliveryServiceEnsName,
                    'gashawk',
                    ownerWallet.address,
                ),
            ).rejects.toThrow();
        });
    });
    describe('dapp auth', () => {
        it('creates new lsp from signature provided by dapp', async () => {
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

            const dappAuthMessage = 'hello from dapp';
            const dappAuthSig = await ownerWallet.signMessage(dappAuthMessage);

            const lsp = await createLspFromDappSig(
                mockProvider,
                offchainResolverUrl,
                deliveryServiceEnsName,
                'gashawk',
                ownerWallet.address,
                dappAuthMessage,
                dappAuthSig,
            );

            expect(lsp).toEqual({
                ensName: `lsp.${ownerWallet.address}.gashawk.dm3.eth`,
                keys: {
                    encryptionKeyPair: expect.anything(),
                    signingKeyPair: expect.anything(),
                    storageEncryptionKey: expect.anything(),
                    storageEncryptionNonce: expect.anything(),
                },
                nonce: expect.anything(),
                privateKey: expect.anything(),
            });
        });
    });
});
