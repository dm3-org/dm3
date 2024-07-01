import {
    MockDeliveryServiceProfile,
    MockMessageFactory,
    MockedUserProfile,
    getMockDeliveryServiceProfile,
    mockUserProfile,
} from '@dm3-org/dm3-lib-test-helper';
import '@testing-library/jest-dom';
import { act, renderHook, waitFor } from '@testing-library/react';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import { ethers } from 'ethers';
import { AuthContext } from '../../context/AuthContext';
import { ConversationContext } from '../../context/ConversationContext';
import { DeliveryServiceContext } from '../../context/DeliveryServiceContext';
import { StorageContext } from '../../context/StorageContext';
import { TLDContext } from '../../context/TLDContext';
import { getMockedAuthContext } from '../../context/testHelper/getMockedAuthContext';
import { getMockedConversationContext } from '../../context/testHelper/getMockedConversationContext';
import { getMockedDeliveryServiceContext } from '../../context/testHelper/getMockedDeliveryServiceContext';
import {
    DEFAULT_DM3_CONFIGURATION,
    getMockedDm3Configuration,
} from '../../context/testHelper/getMockedDm3Configuration';
import { getMockedStorageContext } from '../../context/testHelper/getMockedStorageContext';
import { getMockedTldContext } from '../../context/testHelper/getMockedTldContext';
import { getEmptyContact } from '../../interfaces/utils';
import { DM3Configuration } from '../../widget';
import { useMessage } from './useMessage';

describe('useMessage hook test cases', () => {
    const CONTACT_NAME = 'user.dm3.eth';

    it('Should configure useMessage hook', async () => {
        const { result } = renderHook(() => useMessage());
        expect(JSON.stringify(result.current.messages)).toBe(
            JSON.stringify({}),
        );
    });

    it('Should get messages for a contact ', async () => {
        const { result } = renderHook(() => useMessage());
        const messages = await act(async () =>
            result.current.getMessages(CONTACT_NAME),
        );
        expect(messages.length).toBe(0);
    });

    it('Should check contact is loading or not ', async () => {
        const { result } = renderHook(() => useMessage());
        const loading = await act(async () =>
            result.current.contactIsLoading(CONTACT_NAME),
        );
        expect(loading).toBe(false);
    });

    describe('add Message', () => {
        let sender: MockedUserProfile;
        let receiver: MockedUserProfile;
        let ds1: MockDeliveryServiceProfile;
        let ds2: MockDeliveryServiceProfile;

        let axiosMock: MockAdapter;

        beforeEach(async () => {
            sender = await mockUserProfile(
                ethers.Wallet.createRandom(),
                'alice.eth',
                ['ds1.eth'],
            );
            receiver = await mockUserProfile(
                ethers.Wallet.createRandom(),
                'bob.eth',
                ['ds1.eth', 'ds2.eth'],
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
        const CONTACT_NAME = 'user.dm3.eth';

        const configurationContext = getMockedDm3Configuration({
            dm3Configuration: {
                ...DEFAULT_DM3_CONFIGURATION,
            },
        });
        const config: DM3Configuration = configurationContext.dm3Configuration!;

        it('should not add empty message', async () => {
            const storageContext = getMockedStorageContext({
                editMessageBatchAsync: jest.fn(),
                storeMessageBatch: jest.fn(),
                storeMessage: jest.fn(),
            });
            const conversationContext = getMockedConversationContext({
                selectedContact: getEmptyContact('max.eth', undefined),
            });
            const deliveryServiceContext = getMockedDeliveryServiceContext({
                //Add websocket mock
                onNewMessage: (cb: Function) => {
                    console.log('on new message');
                },
                removeOnNewMessageListener: jest.fn(),
            });
            const authContext = getMockedAuthContext({});
            const tldContext = getMockedTldContext({});

            const wrapper = ({ children }: { children: any }) => (
                <>
                    <AuthContext.Provider value={authContext}>
                        <TLDContext.Provider value={tldContext}>
                            <StorageContext.Provider value={storageContext}>
                                <ConversationContext.Provider
                                    value={conversationContext}
                                >
                                    <DeliveryServiceContext.Provider
                                        value={deliveryServiceContext}
                                    >
                                        {children}
                                    </DeliveryServiceContext.Provider>
                                </ConversationContext.Provider>
                            </StorageContext.Provider>
                        </TLDContext.Provider>
                    </AuthContext.Provider>
                </>
            );

            const { result } = renderHook(() => useMessage(), {
                wrapper,
            });
            await waitFor(() =>
                expect(result.current.contactIsLoading('max.eth')).toBe(false),
            );

            const messageFactory = MockMessageFactory(sender, receiver, ds1);
            const message = await messageFactory.createMessage('');
            const addMessageResult = await waitFor(() =>
                result.current.addMessage('max.eth', message),
            );

            expect(addMessageResult).toEqual({
                isSuccess: false,
                error: 'Message is empty',
            });
        });
        it('should trim message', async () => {
            const storageContext = getMockedStorageContext({
                editMessageBatchAsync: jest.fn(),
                storeMessageBatch: jest.fn(),
                storeMessage: jest.fn(),
            });
            const conversationContext = getMockedConversationContext({
                selectedContact: getEmptyContact('max.eth', undefined),
            });
            const deliveryServiceContext = getMockedDeliveryServiceContext({
                //Add websocket mock
                onNewMessage: (cb: Function) => {
                    console.log('on new message');
                },
                removeOnNewMessageListener: jest.fn(),
            });
            const authContext = getMockedAuthContext({});
            const tldContext = getMockedTldContext({});

            const wrapper = ({ children }: { children: any }) => (
                <>
                    <AuthContext.Provider value={authContext}>
                        <TLDContext.Provider value={tldContext}>
                            <StorageContext.Provider value={storageContext}>
                                <ConversationContext.Provider
                                    value={conversationContext}
                                >
                                    <DeliveryServiceContext.Provider
                                        value={deliveryServiceContext}
                                    >
                                        {children}
                                    </DeliveryServiceContext.Provider>
                                </ConversationContext.Provider>
                            </StorageContext.Provider>
                        </TLDContext.Provider>
                    </AuthContext.Provider>
                </>
            );

            const { result } = renderHook(() => useMessage(), {
                wrapper,
            });
            await waitFor(() =>
                expect(result.current.contactIsLoading('max.eth')).toBe(false),
            );

            const messageFactory = MockMessageFactory(sender, receiver, ds1);
            const message = await messageFactory.createMessage('         ');
            const addMessageResult = await waitFor(() =>
                result.current.addMessage('max.eth', message),
            );

            expect(addMessageResult).toEqual({
                isSuccess: false,
                error: 'Message is empty',
            });
        });
        it('should add message', async () => {
            const storageContext = getMockedStorageContext({
                editMessageBatchAsync: jest.fn(),
                storeMessageBatch: jest.fn(),
                storeMessage: jest.fn(),
            });
            const conversationContext = getMockedConversationContext({
                selectedContact: getEmptyContact('max.eth', undefined),
            });
            const deliveryServiceContext = getMockedDeliveryServiceContext({
                //Add websocket mock
                onNewMessage: (cb: Function) => {
                    console.log('on new message');
                },
                removeOnNewMessageListener: jest.fn(),
            });
            const authContext = getMockedAuthContext({});
            const tldContext = getMockedTldContext({});

            const wrapper = ({ children }: { children: any }) => (
                <>
                    <AuthContext.Provider value={authContext}>
                        <TLDContext.Provider value={tldContext}>
                            <StorageContext.Provider value={storageContext}>
                                <ConversationContext.Provider
                                    value={conversationContext}
                                >
                                    <DeliveryServiceContext.Provider
                                        value={deliveryServiceContext}
                                    >
                                        {children}
                                    </DeliveryServiceContext.Provider>
                                </ConversationContext.Provider>
                            </StorageContext.Provider>
                        </TLDContext.Provider>
                    </AuthContext.Provider>
                </>
            );

            const { result } = renderHook(() => useMessage(), {
                wrapper,
            });
            await waitFor(() =>
                expect(result.current.contactIsLoading('max.eth')).toBe(false),
            );

            const messageFactory = MockMessageFactory(sender, receiver, ds1);
            const message = await messageFactory.createMessage('hello dm3');
            const addMessageResult = await waitFor(() =>
                result.current.addMessage('alice.eth', message),
            );

            expect(addMessageResult).toEqual({
                isSuccess: true,
                error: undefined,
            });
            expect(result.current.messages['alice.eth'].length).toBe(1);
        });
        it('should send message to ds', async () => {
            axiosMock = new MockAdapter(axios);

            axiosMock.onPost('http://ds1.api/rpc').reply(200, {});

            axiosMock.onPost('http://ds2.api/rpc').reply(200, {});

            const storageContext = getMockedStorageContext({
                editMessageBatchAsync: jest.fn(),
                storeMessageBatch: jest.fn(),
                storeMessage: jest.fn(),
                getNumberOfMessages: jest.fn().mockResolvedValue(0),
                getMessages: jest.fn().mockResolvedValue([]),
            });

            const conversationContext = getMockedConversationContext({
                selectedContact: getEmptyContact('max.eth', undefined),
                contacts: [
                    {
                        name: '',
                        message: '',
                        image: 'human.svg',
                        contactDetails: {
                            account: {
                                ensName: receiver.account.ensName,
                                profileSignature:
                                    receiver.signedUserProfile.signature,
                                profile: receiver.signedUserProfile.profile,
                            },
                            deliveryServiceProfiles: [
                                ds1.deliveryServiceProfile,
                                ds2.deliveryServiceProfile,
                            ],
                        },
                        isHidden: false,
                        messageSizeLimit: 10000000,
                    },
                ],
            });
            const deliveryServiceContext = getMockedDeliveryServiceContext({
                //Add websocket mock
                onNewMessage: (cb: Function) => {
                    console.log('on new message');
                },
                fetchNewMessages: jest.fn().mockResolvedValue([]),
                removeOnNewMessageListener: jest.fn(),
                syncAcknowledgment: jest.fn(),
            });

            const authContext = getMockedAuthContext({
                profileKeys: receiver.profileKeys,
                account: {
                    ensName: sender.account.ensName,
                    profile: sender.signedUserProfile.profile,
                },
            });
            const tldContext = getMockedTldContext({});

            const wrapper = ({ children }: { children: any }) => (
                <>
                    <AuthContext.Provider value={authContext}>
                        <TLDContext.Provider value={tldContext}>
                            <StorageContext.Provider value={storageContext}>
                                <ConversationContext.Provider
                                    value={conversationContext}
                                >
                                    <DeliveryServiceContext.Provider
                                        value={deliveryServiceContext}
                                    >
                                        {children}
                                    </DeliveryServiceContext.Provider>
                                </ConversationContext.Provider>
                            </StorageContext.Provider>
                        </TLDContext.Provider>
                    </AuthContext.Provider>
                </>
            );

            const { result } = renderHook(() => useMessage(), {
                wrapper,
            });
            await waitFor(() =>
                expect(result.current.contactIsLoading('max.eth')).toBe(false),
            );

            const messageFactory = MockMessageFactory(sender, receiver, ds1);
            const message = await messageFactory.createMessage('hello dm3');
            const addMessageResult = await waitFor(() =>
                result.current.addMessage('bob.eth', message),
            );

            expect(addMessageResult).toEqual({
                isSuccess: true,
                error: undefined,
            });
            expect(result.current.messages['bob.eth'].length).toBe(1);

            expect(axiosMock.history.post.length).toBe(2);
            expect(axiosMock.history.post[0].baseURL).toBe('http://ds1.api');
            expect(axiosMock.history.post[1].baseURL).toBe('http://ds2.api');
        });
        it('should fail if message is larger than the sizeLimit', async () => {
            axiosMock = new MockAdapter(axios);

            axiosMock.onPost('http://ds1.api/rpc').reply(200, {});

            axiosMock.onPost('http://ds2.api/rpc').reply(200, {});

            const storageContext = getMockedStorageContext({
                editMessageBatchAsync: jest.fn(),
                storeMessageBatch: jest.fn(),
                storeMessage: jest.fn(),
                getNumberOfMessages: jest.fn().mockResolvedValue(0),
                getMessages: jest.fn().mockResolvedValue([]),
            });

            const conversationContext = getMockedConversationContext({
                selectedContact: getEmptyContact('max.eth', undefined),
                contacts: [
                    {
                        name: '',
                        message: '',
                        image: 'human.svg',
                        contactDetails: {
                            account: {
                                ensName: receiver.account.ensName,
                                profileSignature:
                                    receiver.signedUserProfile.signature,
                                profile: receiver.signedUserProfile.profile,
                            },
                            deliveryServiceProfiles: [
                                ds1.deliveryServiceProfile,
                                ds2.deliveryServiceProfile,
                            ],
                        },
                        isHidden: false,
                        messageSizeLimit: 1000,
                    },
                ],
            });
            const deliveryServiceContext = getMockedDeliveryServiceContext({
                //Add websocket mock
                onNewMessage: (cb: Function) => {
                    console.log('on new message');
                },
                fetchNewMessages: jest.fn().mockResolvedValue([]),
                removeOnNewMessageListener: jest.fn(),
                syncAcknowledgment: jest.fn(),
            });

            const authContext = getMockedAuthContext({
                profileKeys: receiver.profileKeys,
                account: {
                    ensName: sender.account.ensName,
                    profile: sender.signedUserProfile.profile,
                },
            });
            const tldContext = getMockedTldContext({});

            const wrapper = ({ children }: { children: any }) => (
                <>
                    <AuthContext.Provider value={authContext}>
                        <TLDContext.Provider value={tldContext}>
                            <StorageContext.Provider value={storageContext}>
                                <ConversationContext.Provider
                                    value={conversationContext}
                                >
                                    <DeliveryServiceContext.Provider
                                        value={deliveryServiceContext}
                                    >
                                        {children}
                                    </DeliveryServiceContext.Provider>
                                </ConversationContext.Provider>
                            </StorageContext.Provider>
                        </TLDContext.Provider>
                    </AuthContext.Provider>
                </>
            );

            const { result } = renderHook(() => useMessage(), {
                wrapper,
            });
            await waitFor(() =>
                expect(result.current.contactIsLoading('max.eth')).toBe(false),
            );

            const messageFactory = MockMessageFactory(sender, receiver, ds1);
            const message = await messageFactory.createMessage('hello dm3');
            const addMessageResult = await waitFor(() =>
                result.current.addMessage('bob.eth', message),
            );

            expect(addMessageResult).toEqual({
                isSuccess: false,
                error: 'The size of the message is larger than limit 1000 bytes. Please reduce the message size.',
            });
            expect(result.current.messages['bob.eth'].length).toBe(0);
            expect(axiosMock.history.post.length).toBe(0);
        });
    });

    describe('initialize message', () => {
        let sender: MockedUserProfile;
        let receiver: MockedUserProfile;
        let ds: any;

        beforeEach(async () => {
            sender = await mockUserProfile(
                ethers.Wallet.createRandom(),
                'alice.eth',
                ['https://example.com'],
            );
            receiver = await mockUserProfile(
                ethers.Wallet.createRandom(),
                'bob.eth',
                ['https://example.com'],
            );
            ds = await getMockDeliveryServiceProfile(
                ethers.Wallet.createRandom(),
                'https://example.com',
            );
        });

        it('should initialize message from storage ', async () => {
            const messageFactory = MockMessageFactory(sender, receiver, ds);
            const message1 = await messageFactory.createStorageEnvelopContainer(
                'hello dm3',
            );
            const message2 = await messageFactory.createStorageEnvelopContainer(
                'hello world',
            );
            const message3 = await messageFactory.createStorageEnvelopContainer(
                'hello bob',
            );

            const storageContext = getMockedStorageContext({
                editMessageBatchAsync: jest.fn(),
                storeMessageBatch: jest.fn(),
                storeMessage: jest.fn(),
                getMessages: jest
                    .fn()
                    .mockResolvedValue([message1, message2, message3]),
                getNumberOfMessages: jest.fn().mockResolvedValue(3),
            });
            const conversationContext = getMockedConversationContext({
                selectedContact: getEmptyContact('max.eth', undefined),
                contacts: [getEmptyContact('alice.eth', undefined)],
            });
            const deliveryServiceContext = getMockedDeliveryServiceContext({
                onNewMessage: (cb: Function) => {
                    console.log('on new message');
                },
                fetchNewMessages: jest.fn().mockResolvedValue([]),
                syncAcknowledgment: jest.fn(),
                removeOnNewMessageListener: jest.fn(),
            });
            const authContext = getMockedAuthContext({
                profileKeys: receiver.profileKeys,
                account: {
                    ensName: 'bob.eth',
                    profile: {
                        deliveryServices: ['ds.eth'],
                        publicEncryptionKey: '',
                        publicSigningKey: '',
                    },
                },
            });
            const tldContext = getMockedTldContext({});

            const wrapper = ({ children }: { children: any }) => (
                <>
                    <AuthContext.Provider value={authContext}>
                        <TLDContext.Provider value={tldContext}>
                            <StorageContext.Provider value={storageContext}>
                                <ConversationContext.Provider
                                    value={conversationContext}
                                >
                                    <DeliveryServiceContext.Provider
                                        value={deliveryServiceContext}
                                    >
                                        {children}
                                    </DeliveryServiceContext.Provider>
                                </ConversationContext.Provider>
                            </StorageContext.Provider>
                        </TLDContext.Provider>
                    </AuthContext.Provider>
                </>
            );

            const { result } = renderHook(() => useMessage(), {
                wrapper,
            });
            //Wait until bobs messages have been initialized
            await waitFor(
                () =>
                    result.current.contactIsLoading('alice.eth') === false &&
                    result.current.messages['alice.eth'].length > 0,
            );

            expect(result.current.contactIsLoading('alice.eth')).toBe(false);
            expect(result.current.messages['alice.eth'].length).toBe(3);
        });
        it('should initialize message from DS ', async () => {
            const messageFactory = MockMessageFactory(sender, receiver, ds);
            const message1 = await messageFactory.createEncryptedEnvelop(
                'hello dm3',
            );
            const message2 = await messageFactory.createEncryptedEnvelop(
                'hello world',
            );
            const message3 = await messageFactory.createEncryptedEnvelop(
                'hello bob',
            );

            const storageContext = getMockedStorageContext({
                editMessageBatchAsync: jest.fn(),
                storeMessageBatch: jest.fn(),
                storeMessage: jest.fn(),
                getMessages: jest.fn().mockResolvedValue([]),
                getNumberOfMessages: jest.fn().mockResolvedValue(0),
            });
            const conversationContext = getMockedConversationContext({
                selectedContact: getEmptyContact('max.eth', undefined),
                contacts: [getEmptyContact('alice.eth', undefined)],
            });
            const deliveryServiceContext = getMockedDeliveryServiceContext({
                onNewMessage: (cb: Function) => {
                    console.log('on new message');
                },
                fetchNewMessages: jest
                    .fn()
                    .mockResolvedValue([message1, message2, message3]),
                syncAcknowledgment: jest.fn(),
                removeOnNewMessageListener: jest.fn(),
            });
            const authContext = getMockedAuthContext({
                profileKeys: receiver.profileKeys,
                account: {
                    ensName: 'bob.eth',
                    profile: {
                        deliveryServices: ['ds.eth'],
                        publicEncryptionKey: '',
                        publicSigningKey: '',
                    },
                },
            });
            const tldContext = getMockedTldContext({});

            const wrapper = ({ children }: { children: any }) => (
                <>
                    <AuthContext.Provider value={authContext}>
                        <TLDContext.Provider value={tldContext}>
                            <StorageContext.Provider value={storageContext}>
                                <ConversationContext.Provider
                                    value={conversationContext}
                                >
                                    <DeliveryServiceContext.Provider
                                        value={deliveryServiceContext}
                                    >
                                        {children}
                                    </DeliveryServiceContext.Provider>
                                </ConversationContext.Provider>
                            </StorageContext.Provider>
                        </TLDContext.Provider>
                    </AuthContext.Provider>
                </>
            );

            const { result } = renderHook(() => useMessage(), {
                wrapper,
            });
            //Wait until bobs messages have been initialized
            await waitFor(
                () =>
                    result.current.contactIsLoading('alice.eth') === false &&
                    result.current.messages['alice.eth'].length > 0,
            );

            expect(result.current.contactIsLoading('alice.eth')).toBe(false);
            expect(result.current.messages['alice.eth'].length).toBe(3);
        });
    });
    describe('message pagination', () => {
        let sender: MockedUserProfile;
        let receiver: MockedUserProfile;
        let ds: any;

        beforeEach(async () => {
            sender = await mockUserProfile(
                ethers.Wallet.createRandom(),
                'alice.eth',
                ['https://example.com'],
            );
            receiver = await mockUserProfile(
                ethers.Wallet.createRandom(),
                'bob.eth',
                ['https://example.com'],
            );
            ds = await getMockDeliveryServiceProfile(
                ethers.Wallet.createRandom(),
                'https://example.com',
            );
        });
        it('should load more messages from Storage', async () => {
            const messageFactory = MockMessageFactory(sender, receiver, ds);
            //const messages
            const storageContext = getMockedStorageContext({
                editMessageBatchAsync: jest.fn(),
                storeMessageBatch: jest.fn(),
                storeMessage: jest.fn(),
                getMessages: async (
                    contactName: string,
                    pageSize: number,
                    offset: number,
                ) =>
                    Promise.all(
                        Array.from({ length: pageSize }, (_, i) =>
                            messageFactory.createStorageEnvelopContainer(
                                'hello dm3 ' + i + offset,
                            ),
                        ),
                    ),
            });
            const conversationContext = getMockedConversationContext({
                selectedContact: getEmptyContact('max.eth', undefined),
                contacts: [getEmptyContact('alice.eth', undefined)],
            });
            const deliveryServiceContext = getMockedDeliveryServiceContext({
                onNewMessage: (cb: Function) => {
                    console.log('on new message');
                },
                fetchNewMessages: jest.fn().mockResolvedValue([]),
                syncAcknowledgment: jest.fn(),
                removeOnNewMessageListener: jest.fn(),
            });
            const authContext = getMockedAuthContext({
                profileKeys: receiver.profileKeys,
                account: {
                    ensName: 'bob.eth',
                    profile: {
                        deliveryServices: ['ds.eth'],
                        publicEncryptionKey: '',
                        publicSigningKey: '',
                    },
                },
            });
            const tldContext = getMockedTldContext({});

            const wrapper = ({ children }: { children: any }) => (
                <>
                    <AuthContext.Provider value={authContext}>
                        <TLDContext.Provider value={tldContext}>
                            <StorageContext.Provider value={storageContext}>
                                <ConversationContext.Provider
                                    value={conversationContext}
                                >
                                    <DeliveryServiceContext.Provider
                                        value={deliveryServiceContext}
                                    >
                                        {children}
                                    </DeliveryServiceContext.Provider>
                                </ConversationContext.Provider>
                            </StorageContext.Provider>
                        </TLDContext.Provider>
                    </AuthContext.Provider>
                </>
            );

            const { result } = renderHook(() => useMessage(), {
                wrapper,
            });
            //Wait until bobs messages have been initialized
            await waitFor(
                () =>
                    result.current.contactIsLoading('alice.eth') === false &&
                    result.current.messages['alice.eth'].length > 0,
            );

            expect(result.current.contactIsLoading('alice.eth')).toBe(false);
            expect(result.current.messages['alice.eth'].length).toBe(100);

            await act(async () => result.current.loadMoreMessages('alice.eth'));

            //Wait until new messages have been loaded
            await waitFor(
                () =>
                    result.current.contactIsLoading('alice.eth') === false &&
                    result.current.messages['alice.eth'].length > 100,
            );

            expect(result.current.contactIsLoading('alice.eth')).toBe(false);
            expect(result.current.messages['alice.eth'].length).toBe(200);
        });
        it('messages from sources different as storage should not be considered in pagination calculation', async () => {
            const messageFactory = MockMessageFactory(sender, receiver, ds);
            //const messages
            const storageContext = getMockedStorageContext({
                editMessageBatchAsync: jest.fn(),
                storeMessageBatch: jest.fn(),
                storeMessage: jest.fn(),
                getMessages: async (
                    contactName: string,
                    pageSize: number,
                    offset: number,
                ) =>
                    Promise.all(
                        Array.from({ length: pageSize }, (_, i) =>
                            messageFactory.createStorageEnvelopContainer(
                                'hello dm3 ' + i + offset,
                            ),
                        ),
                    ),
            });
            const conversationContext = getMockedConversationContext({
                selectedContact: getEmptyContact('max.eth', undefined),
                contacts: [getEmptyContact('alice.eth', undefined)],
            });
            const deliveryServiceContext = getMockedDeliveryServiceContext({
                onNewMessage: (cb: Function) => {
                    console.log('on new message');
                },
                fetchNewMessages: async (_: string) =>
                    Promise.all(
                        Array.from({ length: 13 }, (_, i) =>
                            messageFactory.createEncryptedEnvelop(
                                'hello dm3 from ds' + i,
                            ),
                        ),
                    ),
                syncAcknowledgment: jest.fn(),
                removeOnNewMessageListener: jest.fn(),
            });
            const authContext = getMockedAuthContext({
                profileKeys: receiver.profileKeys,
                account: {
                    ensName: 'bob.eth',
                    profile: {
                        deliveryServices: ['ds.eth'],
                        publicEncryptionKey: '',
                        publicSigningKey: '',
                    },
                },
            });
            const tldContext = getMockedTldContext({});

            const wrapper = ({ children }: { children: any }) => (
                <>
                    <AuthContext.Provider value={authContext}>
                        <TLDContext.Provider value={tldContext}>
                            <StorageContext.Provider value={storageContext}>
                                <ConversationContext.Provider
                                    value={conversationContext}
                                >
                                    <DeliveryServiceContext.Provider
                                        value={deliveryServiceContext}
                                    >
                                        {children}
                                    </DeliveryServiceContext.Provider>
                                </ConversationContext.Provider>
                            </StorageContext.Provider>
                        </TLDContext.Provider>
                    </AuthContext.Provider>
                </>
            );

            const { result } = renderHook(() => useMessage(), {
                wrapper,
            });
            //Wait until bobs messages have been initialized
            await waitFor(
                () =>
                    result.current.contactIsLoading('alice.eth') === false &&
                    result.current.messages['alice.eth'].length > 0,
            );

            expect(result.current.contactIsLoading('alice.eth')).toBe(false);
            //Initial message number would be storage(100) = Ds (13) == 113
            expect(result.current.messages['alice.eth'].length).toBe(113);

            await act(async () => result.current.loadMoreMessages('alice.eth'));

            //Wait until new messages have been loaded
            await waitFor(
                () =>
                    result.current.contactIsLoading('alice.eth') === false &&
                    result.current.messages['alice.eth'].length > 133,
            );

            expect(result.current.contactIsLoading('alice.eth')).toBe(false);
            expect(result.current.messages['alice.eth'].length).toBe(213);
            //991 = 99 message 100(since pageSize starts from 0) = 1 offset
            expect(
                result.current.messages['alice.eth'][212].envelop.message
                    .message,
            ).toBe('hello dm3 991');
        });
    });
});
