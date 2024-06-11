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
import { TLDContext } from '../../context/TLDContext';
import { getMockedAuthContext } from '../../context/testHelper/getMockedAuthContext';
import { getMockedDeliveryServiceContext } from '../../context/testHelper/getMockedDeliveryServiceContext';
import {
    DEFAULT_DM3_CONFIGURATION,
    getMockedDm3Configuration,
} from '../../context/testHelper/getMockedDm3Configuration';
import { getMockedStorageContext } from '../../context/testHelper/getMockedStorageContext';
import { getMockedTldContext } from '../../context/testHelper/getMockedTldContext';
import { DM3Configuration } from '../../widget';
import { useConversation } from './useConversation';

describe('useConversation hook test cases', () => {
    const CONTACT_NAME = 'user.dm3.eth';

    const configurationContext = getMockedDm3Configuration({
        dm3Configuration: {
            ...DEFAULT_DM3_CONFIGURATION,
        },
    });
    const config: DM3Configuration = configurationContext.dm3Configuration!;

    describe('hide contact', () => {
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
            await act(async () =>
                result.current.setSelectedContactName(undefined),
            );
            await waitFor(() =>
                expect(result.current.selectedContact).toBe(undefined),
            );
        });

        it('Should hide a contact', async () => {
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
    });

    describe('add conversation', () => {
        it('Should add multiple contacts', async () => {
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
            await act(async () => result.current.addConversation('bob.eth'));
            await act(async () => result.current.addConversation('liza.eth'));
            await act(async () => result.current.addConversation('heroku.eth'));
            await act(async () => result.current.addConversation('samar.eth'));
            await waitFor(() => expect(result.current.contacts.length).toBe(4));
        });
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
            expect(conversations[0].contactDetails.account.ensName).toBe(
                'max.eth',
            );
        });
        it('add default contact if specified in conversation list', async () => {
            const configurationContext = getMockedDm3Configuration({
                dm3Configuration: {
                    ...DEFAULT_DM3_CONFIGURATION,
                    defaultContact: 'mydefaultcontract.eth',
                },
            });
            const config: DM3Configuration =
                configurationContext.dm3Configuration!;
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

            const tldContext = getMockedTldContext({
                resolveTLDtoAlias: async (alias: string) => {
                    if (alias === 'mydefaultcontract.eth') {
                        return 'mydefaultcontract.eth';
                    }
                    return alias;
                },
            });

            const wrapper = ({ children }: { children: any }) => (
                <>
                    <AuthContext.Provider value={authContext}>
                        <TLDContext.Provider value={tldContext}>
                            <StorageContext.Provider value={storageContext}>
                                <DeliveryServiceContext.Provider
                                    value={deliveryServiceContext}
                                >
                                    {children}
                                </DeliveryServiceContext.Provider>
                            </StorageContext.Provider>
                        </TLDContext.Provider>
                    </AuthContext.Provider>
                </>
            );

            const { result } = renderHook(() => useConversation(config), {
                wrapper,
            });
            await waitFor(() => expect(result.current.initialized).toBe(true));
            const conversations = result.current.contacts;
            expect(conversations.length).toBe(2);
            expect(conversations[0].contactDetails.account.ensName).toBe(
                'max.eth',
            );
            expect(conversations[1].contactDetails.account.ensName).toBe(
                'mydefaultcontract.eth',
            );
        });
        it('default contact should only appear once when loaded from config and storage', async () => {
            const configurationContext = getMockedDm3Configuration({
                dm3Configuration: {
                    ...DEFAULT_DM3_CONFIGURATION,
                    defaultContact: 'mydefaultcontract.eth',
                },
            });
            const config: DM3Configuration =
                configurationContext.dm3Configuration!;
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
                        {
                            contactEnsName: 'mydefaultcontract.eth',
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

            const tldContext = getMockedTldContext({
                resolveTLDtoAlias: async (alias: string) => {
                    if (alias === 'mydefaultcontract.eth') {
                        return 'mydefaultcontract.eth';
                    }
                    return alias;
                },
            });

            const wrapper = ({ children }: { children: any }) => (
                <>
                    <AuthContext.Provider value={authContext}>
                        <TLDContext.Provider value={tldContext}>
                            <StorageContext.Provider value={storageContext}>
                                <DeliveryServiceContext.Provider
                                    value={deliveryServiceContext}
                                >
                                    {children}
                                </DeliveryServiceContext.Provider>
                            </StorageContext.Provider>
                        </TLDContext.Provider>
                    </AuthContext.Provider>
                </>
            );

            const { result } = renderHook(() => useConversation(config), {
                wrapper,
            });
            await waitFor(() => expect(result.current.initialized).toBe(true));
            const conversations = result.current.contacts;
            expect(conversations.length).toBe(2);
            expect(conversations[0].contactDetails.account.ensName).toBe(
                'max.eth',
            );
            expect(conversations[1].contactDetails.account.ensName).toBe(
                'mydefaultcontract.eth',
            );
        });
        it('hidden contact should not appears as hidden in the conversation list', async () => {
            const configurationContext = getMockedDm3Configuration({
                dm3Configuration: {
                    ...DEFAULT_DM3_CONFIGURATION,
                    defaultContact: 'mydefaultcontract.eth',
                },
            });
            const config: DM3Configuration =
                configurationContext.dm3Configuration!;
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
                            contactEnsName: 'ron.eth',
                            isHidden: true,
                            messageCounter: 1,
                        },
                        {
                            contactEnsName: 'max.eth',
                            isHidden: false,
                            messageCounter: 1,
                        },
                        {
                            contactEnsName: 'mydefaultcontract.eth',
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

            const tldContext = getMockedTldContext({
                resolveTLDtoAlias: async (alias: string) => {
                    if (alias === 'mydefaultcontract.eth') {
                        return 'mydefaultcontract.eth';
                    }
                    return alias;
                },
            });

            const wrapper = ({ children }: { children: any }) => (
                <>
                    <AuthContext.Provider value={authContext}>
                        <TLDContext.Provider value={tldContext}>
                            <StorageContext.Provider value={storageContext}>
                                <DeliveryServiceContext.Provider
                                    value={deliveryServiceContext}
                                >
                                    {children}
                                </DeliveryServiceContext.Provider>
                            </StorageContext.Provider>
                        </TLDContext.Provider>
                    </AuthContext.Provider>
                </>
            );

            const { result } = renderHook(() => useConversation(config), {
                wrapper,
            });
            await waitFor(() => expect(result.current.initialized).toBe(true));
            const conversations = result.current.contacts;

            expect(conversations.length).toBe(3);
            expect(conversations[0].contactDetails.account.ensName).toBe(
                'ron.eth',
            );
            expect(conversations[1].contactDetails.account.ensName).toBe(
                'max.eth',
            );
            expect(conversations[2].contactDetails.account.ensName).toBe(
                'mydefaultcontract.eth',
            );

            expect(conversations[0].isHidden).toBe(true);
            expect(conversations[1].isHidden).toBe(false);
            expect(conversations[2].isHidden).toBe(false);
        });
    });
    describe('add Conversation', () => {
        it('dont add own address as conversation', async () => {
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
                addConversationAsync: jest.fn(),
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
            //adding a different address to a conversation is possible
            await waitFor(() => result.current.addConversation('bob.eth'));
            //adding own address to a conversation is not possible
            await waitFor(() => result.current.addConversation('alice.eth'));

            const conversations = result.current.contacts;
            expect(conversations.length).toBe(2);
            expect(conversations[0].contactDetails.account.ensName).toBe(
                'max.eth',
            );
            expect(conversations[1].contactDetails.account.ensName).toBe(
                'bob.eth',
            );
        });
    });
});
