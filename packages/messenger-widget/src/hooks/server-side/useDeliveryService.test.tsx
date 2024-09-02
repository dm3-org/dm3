import { Conversation } from '@dm3-org/dm3-lib-storage';
import {
    MockDeliveryServiceProfile,
    MockedUserProfile,
    getMockDeliveryServiceProfile,
    mockUserProfile,
} from '@dm3-org/dm3-lib-test-helper';
import { renderHook, waitFor } from '@testing-library/react';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import { ethers } from 'ethers';
import { AuthContext, AuthContextType } from '../../context/AuthContext';
import {
    MainnetProviderContext,
    MainnetProviderContextType,
} from '../../context/ProviderContext';
import {
    StorageContext,
    StorageContextType,
} from '../../context/StorageContext';
import { getMockedAuthContext } from '../../context/testHelper/getMockedAuthContext';
import { getMockedMainnetProviderContext } from '../../context/testHelper/getMockedMainnetProviderContext';
import { getMockedStorageContext } from '../../context/testHelper/getMockedStorageContext';
import { useDeliveryService } from './useDeliveryService';
import { normalizeEnsName } from '@dm3-org/dm3-lib-profile';

describe('useDeliveryService', () => {
    let sender: MockedUserProfile;
    let receiver: MockedUserProfile;
    let ds: MockDeliveryServiceProfile;

    let axiosMock: MockAdapter;

    beforeEach(async () => {
        sender = await mockUserProfile(
            ethers.Wallet.createRandom(),
            'alice.eth',
            ['http://ds1.api'],
        );
        receiver = await mockUserProfile(
            ethers.Wallet.createRandom(),
            'bob.eth',
            ['http://ds1.api'],
        );
        ds = await getMockDeliveryServiceProfile(
            ethers.Wallet.createRandom(),
            'http://ds1.api',
        );
    });
    describe('initialize', () => {
        it('initiliaze ds with  1 connector', async () => {
            axiosMock = new MockAdapter(axios);

            axiosMock
                .onPost('http://resolver.api/profile/address')
                .reply(200, {});

            axiosMock
                .onGet(
                    `http://ds1.api/profile/${normalizeEnsName(
                        sender.address,
                    )}`,
                )
                .reply(404, {});

            axiosMock
                .onPost(
                    `http://ds1.api/profile/${normalizeEnsName(
                        sender.address,
                    )}`,
                )
                .reply(200, 'new-token');

            console.log(
                `http://ds1.api/profile/${normalizeEnsName(sender.address)}`,
            );

            //Mock challenge
            axiosMock
                .onGet(
                    `http://ds1.api/auth/${normalizeEnsName(sender.address)}`,
                )
                .reply(200, {
                    challenge: 'challenge',
                });

            const authContext: AuthContextType = getMockedAuthContext({
                account: {
                    ensName: 'alice.eth',
                    profile: {
                        deliveryServices: ['ds.eth'],
                        publicEncryptionKey: '',
                        publicSigningKey: '',
                    },
                },
                isProfileReady: true,
                ethAddress: ethers.utils.getAddress(sender.address),
            });

            const mockProvider = {
                //resolveName: () => billboard1profile.address,
                getResolver: (ensName: string) => {
                    if (ensName === 'ds.eth') {
                        return {
                            getText: () => ds.stringified,
                        } as unknown as ethers.providers.Resolver;
                    }

                    throw new Error('mock provider unknown ensName');
                },
            } as unknown as ethers.providers.JsonRpcProvider;

            const mainnetProvderContext = getMockedMainnetProviderContext({
                provider: mockProvider,
            });

            const storageContext: StorageContextType = getMockedStorageContext({
                getConversations: function (
                    page: number,
                ): Promise<Conversation[]> {
                    return Promise.resolve([]);
                },
                addConversationAsync: jest.fn(),
                toggleHideContactAsync: jest.fn(),
                initialized: true,
            });

            const wrapper = ({ children }: { children: any }) => (
                <>
                    <MainnetProviderContext.Provider
                        value={mainnetProvderContext}
                    >
                        <AuthContext.Provider value={authContext}>
                            <StorageContext.Provider value={storageContext}>
                                {children}
                            </StorageContext.Provider>
                        </AuthContext.Provider>
                    </MainnetProviderContext.Provider>
                </>
            );
            const { result } = renderHook(() => useDeliveryService(), {
                wrapper,
            });

            await waitFor(() => result.current.isInitialized === true);
            await waitFor(() => result.current.isInitialized === true);

            expect(result.current.isInitialized).toEqual(true);

            expect(result.current.connectors.length).toEqual(1);
            expect(result.current.connectors[0]['ensName']).toEqual(
                normalizeEnsName(sender.address),
            );
        });
    });

    describe('account change', () => {
        it('should remove connectors on account change', async () => {
            axiosMock = new MockAdapter(axios);

            axiosMock
                .onPost('http://resolver.api/profile/address')
                .reply(200, {});

            axiosMock
                .onGet(
                    `http://ds1.api/profile/${normalizeEnsName(
                        sender.address,
                    )}`,
                )
                .reply(404, {});

            axiosMock
                .onPost(
                    `http://ds1.api/profile/${normalizeEnsName(
                        sender.address,
                    )}`,
                )
                .reply(200, 'new-token');

            console.log(
                `http://ds1.api/profile/${normalizeEnsName(sender.address)}`,
            );

            //Mock challenge
            axiosMock
                .onGet(
                    `http://ds1.api/auth/${normalizeEnsName(sender.address)}`,
                )
                .reply(200, {
                    challenge: 'challenge',
                });

            const authContext: AuthContextType = getMockedAuthContext({
                account: {
                    ensName: 'alice.eth',
                    profile: {
                        deliveryServices: ['ds.eth'],
                        publicEncryptionKey: '',
                        publicSigningKey: '',
                    },
                },
                isProfileReady: true,
                ethAddress: ethers.utils.getAddress(sender.address),
            });

            const mockProvider = {
                //resolveName: () => billboard1profile.address,
                getResolver: (ensName: string) => {
                    if (ensName === 'ds.eth') {
                        return {
                            getText: () => ds.stringified,
                        } as unknown as ethers.providers.Resolver;
                    }

                    throw new Error('mock provider unknown ensName');
                },
            } as any as ethers.providers.JsonRpcProvider;

            const mainnetProvderContext: MainnetProviderContextType =
                getMockedMainnetProviderContext({
                    provider: mockProvider,
                });

            const storageContext: StorageContextType = getMockedStorageContext({
                getConversations: function (
                    page: number,
                ): Promise<Conversation[]> {
                    return Promise.resolve([]);
                },
                addConversationAsync: jest.fn(),
                toggleHideContactAsync: jest.fn(),
                initialized: true,
            });

            const wrapper = ({ children }: { children: any }) => (
                <>
                    <MainnetProviderContext.Provider
                        value={mainnetProvderContext}
                    >
                        <AuthContext.Provider value={authContext}>
                            <StorageContext.Provider value={storageContext}>
                                {children}
                            </StorageContext.Provider>
                        </AuthContext.Provider>
                    </MainnetProviderContext.Provider>
                </>
            );
            const { result, rerender } = renderHook(
                () => useDeliveryService(),
                {
                    wrapper,
                },
            );

            await waitFor(() => result.current.isInitialized === true);
            await waitFor(() => result.current.isInitialized === true);

            expect(result.current.isInitialized).toEqual(true);

            expect(result.current.connectors.length).toEqual(1);
            expect(result.current.connectors[0]['ensName']).toEqual(
                normalizeEnsName(sender.address),
            );

            //Change account
            //Set the account to undefined. The hook should reset to its initila state
            authContext.ethAddress = undefined;
            authContext.account = undefined;
            authContext.profileKeys = undefined;
            authContext.isProfileReady = false;
            await rerender();
            await waitFor(() => result.current.isInitialized === false);
            await waitFor(() => result.current.isInitialized === false);

            expect(result.current.isInitialized).toEqual(false);
            expect(result.current.connectors.length).toEqual(0);
        });
    });
});
