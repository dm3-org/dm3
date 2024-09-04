import { Conversation } from '@dm3-org/dm3-lib-storage';
import {
    MockDeliveryServiceProfile,
    MockedUserProfile,
    getMockDeliveryServiceProfile,
    mockUserProfile,
} from '@dm3-org/dm3-lib-test-helper';
import '@testing-library/jest-dom';
import { renderHook } from '@testing-library/react';
import MockAdapter from 'axios-mock-adapter';
import { ethers } from 'ethers';
import { AuthContext, AuthContextType } from '../../context/AuthContext';
import {
    DeliveryServiceContext,
    DeliveryServiceContextType,
} from '../../context/DeliveryServiceContext';
import {
    StorageContext,
    StorageContextType,
} from '../../context/StorageContext';
import { getMockedAuthContext } from '../../context/testHelper/getMockedAuthContext';
import { getMockedDeliveryServiceContext } from '../../context/testHelper/getMockedDeliveryServiceContext';
import {
    DEFAULT_DM3_CONFIGURATION,
    getMockedDm3Configuration,
} from '../../context/testHelper/getMockedDm3Configuration';
import { getMockedStorageContext } from '../../context/testHelper/getMockedStorageContext';
import { DM3Configuration } from '../../widget';
import { useHaltDelivery } from './useHaltDelivery';

describe('useConversation hook test cases', () => {
    let sender: MockedUserProfile;
    let receiver: MockedUserProfile;
    let ds1: MockDeliveryServiceProfile;
    let ds2: MockDeliveryServiceProfile;

    let axiosMock: MockAdapter;

    beforeEach(async () => {
        sender = await mockUserProfile(
            ethers.Wallet.createRandom(),
            'alice.eth',
            ['ds1.eth', 'ds2.eth'],
        );
        receiver = await mockUserProfile(
            ethers.Wallet.createRandom(),
            'bob.eth',
            ['ds1.eth'],
        );
        ds1 = await getMockDeliveryServiceProfile(
            ethers.Wallet.createRandom(),
            'http://ds1.api',
        );
        ds2 = await getMockDeliveryServiceProfile(
            ethers.Wallet.createRandom(),
            'http://ds2.api',
        );
    });

    const configurationContext = getMockedDm3Configuration({
        dm3Configuration: {
            ...DEFAULT_DM3_CONFIGURATION,
        },
    });
    const config: DM3Configuration = configurationContext.dm3Configuration!;

    describe('halt delivery', () => {
        it('Should select a contact', async () => {
            const authContext: AuthContextType = getMockedAuthContext({
                account: {
                    ensName: 'alice.eth',
                    profile: {
                        deliveryServices: ['ds.eth'],
                        publicEncryptionKey: '',
                        publicSigningKey: '',
                    },
                },
            });

            const storageContext: StorageContextType = getMockedStorageContext({
                getConversations: function (
                    page: number,
                ): Promise<Conversation[]> {
                    return Promise.resolve([]);
                },
                addConversationAsync: jest.fn(),
                toggleHideContactAsync: jest.fn(),
                getHaltedMessages: () => Promise.resolve([]),
                initialized: true,
            });
            const deliveryServiceContext: DeliveryServiceContextType =
                getMockedDeliveryServiceContext({
                    fetchIncomingMessages: function (ensName: string) {
                        return Promise.resolve([]);
                    },
                    getDeliveryServiceProperties: function (): Promise<any[]> {
                        return Promise.resolve([{ sizeLimit: 0 }]);
                    },
                    isInitialized: true,
                });

            const wrapper = ({ children }: { children: any }) => (
                <>
                    <AuthContext.Provider value={authContext}>
                        <StorageContext.Provider value={storageContext}>
                            <DeliveryServiceContext.Provider
                                value={deliveryServiceContext}
                            >
                                {children}
                            </DeliveryServiceContext.Provider>
                        </StorageContext.Provider>
                    </AuthContext.Provider>
                </>
            );
            const { result } = renderHook(() => useHaltDelivery(), {
                wrapper,
            });
            // await act(async () => result.current.addConversation(CONTACT_NAME));
            // expect(result.current.selectedContact).toBe(undefined);
            // await act(async () =>
            //     result.current.setSelectedContactName(CONTACT_NAME),
            // );
            // await waitFor(() => {
            //     const { selectedContact } = result.current;
            //     expect(selectedContact?.contactDetails.account.ensName).toBe(
            //         CONTACT_NAME,
            //     );
            // });
        });
    });
});
