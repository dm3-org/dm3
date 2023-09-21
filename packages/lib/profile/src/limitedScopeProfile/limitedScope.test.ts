import { ethers } from 'ethers';

import { createLsp } from './index';
import { mockDeliveryServiceProfile } from '../../../../billboard-client/test/helper/mockDeliveryServiceProfile';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import { normalizeEnsName } from '../Profile';

describe('LimitedScopeProfile', () => {
    let ds1: any;
    describe('from random wallet', () => {
        it('retuns a new profile', async () => {
            const deliveryServiceUrl = 'http://ds.dm3.io';
            const offchainResolverUrl = 'http://resolver.dm3.io';
            const deliveryServiceEnsName = 'ds1.dm3.eth';

            const axiosMock = new MockAdapter(axios);

            const mockSetItem = jest.fn();
            const wallet = ethers.Wallet.createRandom();

            axiosMock
                .onPost(
                    `${deliveryServiceUrl}/profile/${normalizeEnsName(
                        wallet.address,
                    )}.gashawk.dm3.eth`,
                )
                .reply(200, 'token');

            axiosMock
                .onPost(`${offchainResolverUrl}/profile/address`)
                .reply(200);

            ds1 = await mockDeliveryServiceProfile(
                ethers.Wallet.createRandom(),
                deliveryServiceUrl,
            );

            const mockProvider = {
                getResolver: (ensName: string) => {
                    return {
                        getText: (record: string) => {
                            return ds1.stringified;
                        },
                    } as unknown as ethers.providers.Resolver;
                },
            } as unknown as ethers.providers.JsonRpcProvider;

            const lsp = await createLsp(
                mockProvider,
                mockSetItem,
                offchainResolverUrl,
                deliveryServiceEnsName,
                wallet,
                'gashawk',
            );

            expect(lsp).toEqual({
                ensName: `${wallet.address}.gashawk.dm3.eth`,
                keys: {
                    encryptionKeyPair: expect.anything(),
                    signingKeyPair: expect.anything(),
                    storageEncryptionKey: expect.anything(),
                    storageEncryptionNonce: expect.anything(),
                },
                token: 'token',
                deliveryServiceUrl: 'http://ds.dm3.io',
            });
            expect(mockSetItem).toBeCalled();
        });
    });
});
