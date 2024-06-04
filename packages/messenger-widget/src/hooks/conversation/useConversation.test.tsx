import { Conversation } from '@dm3-org/dm3-lib-storage';
import '@testing-library/jest-dom';
import { act, renderHook, waitFor } from '@testing-library/react';
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
import { getMockedStorageContext } from '../../context/testHelper/getMockedStorageContext';
import { DM3Configuration } from '../../widget';
import { useConversation } from './useConversation';
import {
    DEFAULT_DM3_CONFIGURATION,
    getMockedDm3Configuration,
} from '../../context/testHelper/getMockedDm3Configuration';

describe('useConversation hook test cases', () => {
    const CONTACT_NAME = 'user.dm3.eth';

    const configurationContext = getMockedDm3Configuration({
        dm3Configuration: {
            ...DEFAULT_DM3_CONFIGURATION,
        },
    });
    const config: DM3Configuration = configurationContext.dm3Configuration!;

    it('Should configure useConversation hook', async () => {
        const { result } = renderHook(() => useConversation(config));
        expect(result.current.contacts.length).toBe(0);
        expect(result.current.conversationCount).toBe(0);
        expect(result.current.initialized).toBe(false);
        expect(result.current.selectedContact).toBe(undefined);
    });

    it('Should add a new contact', async () => {
        const { result } = renderHook(() => useConversation(config));
        const newContact = await act(async () =>
            result.current.addConversation(CONTACT_NAME),
        );
        expect(newContact.name).toBe(CONTACT_NAME);
        await waitFor(() => expect(result.current.contacts.length).toBe(1));
    });

    it('Should add multiple contacts', async () => {
        const { result } = renderHook(() => useConversation(config));
        await act(async () => result.current.addConversation('bob.eth'));
        await act(async () => result.current.addConversation('liza.eth'));
        await act(async () => result.current.addConversation('heroku.eth'));
        await act(async () => result.current.addConversation('samar.eth'));
        await waitFor(() => expect(result.current.contacts.length).toBe(4));
    });

    it('Should select a contact', async () => {
        const { result } = renderHook(() => useConversation(config));
        await act(async () => result.current.addConversation(CONTACT_NAME));
        expect(result.current.selectedContact).toBe(undefined);
        await act(async () =>
            result.current.setSelectedContactName(CONTACT_NAME),
        );
        await waitFor(() => {
            const { selectedContact } = result.current;
            expect(selectedContact?.contactDetails.account.ensName).toBe(
                CONTACT_NAME,
            );
        });
    });

    it('Should unselect a contact', async () => {
        const { result } = renderHook(() => useConversation(config));
        await act(async () => result.current.addConversation(CONTACT_NAME));
        await act(async () =>
            result.current.setSelectedContactName(CONTACT_NAME),
        );
        await waitFor(() => {
            const { selectedContact } = result.current;
            expect(selectedContact?.contactDetails.account.ensName).toBe(
                CONTACT_NAME,
            );
        });
        await act(async () => result.current.setSelectedContactName(undefined));
        await waitFor(() =>
            expect(result.current.selectedContact).toBe(undefined),
        );
    });

    it('Should hide a contact', async () => {
        const { result } = renderHook(() => useConversation(config));
        await act(async () => result.current.addConversation(CONTACT_NAME));
        await waitFor(() =>
            expect(result.current.contacts[0].isHidden).toBe(false),
        );
        await act(async () => result.current.hideContact(CONTACT_NAME));
        await waitFor(() =>
            expect(result.current.contacts[0].isHidden).toBe(true),
        );
    });

    it('Should unhide a contact', async () => {
        const { result } = renderHook(() => useConversation(config));
        await act(async () => result.current.addConversation(CONTACT_NAME));
        await act(async () => result.current.hideContact(CONTACT_NAME));
        await waitFor(() =>
            expect(result.current.contacts[0].isHidden).toBe(true),
        );
        await act(async () =>
            result.current.unhideContact(result.current.contacts[0]),
        );
        await waitFor(() =>
            expect(result.current.contacts[0].isHidden).toBe(false),
        );
    });

    describe('initialize', () => {
        it('reads conversations from storage', async () => {
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
                    return Promise.resolve([
                        {
                            contactEnsName: 'max.eth',
                            isHidden: false,
                            messageCounter: 1,
                        },
                    ]);
                },
                initialized: true,
            });
            const deliveryServiceContext: DeliveryServiceContextType =
                getMockedDeliveryServiceContext({
                    fetchIncommingMessages: function (ensName: string) {
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

            const { result } = renderHook(() => useConversation(config), {
                wrapper,
            });
            await waitFor(() => expect(result.current.initialized).toBe(true));

            const conversations = result.current.contacts;

            expect(conversations.length).toBe(1);
        });
    });
});
