import { decryptAsymmetric } from '@dm3-org/dm3-lib-crypto';
import { EncryptionEnvelop } from '@dm3-org/dm3-lib-messaging';
import { UserProfile, normalizeEnsName } from '@dm3-org/dm3-lib-profile';
import { BigNumber, ethers } from 'ethers';
import { testData } from '../../../../test-data/encrypted-envelops.test';
import { stringify } from '../../shared/src/stringify';
import { getConversationId, getMessages, incomingMessage } from './Messages';
import { Session } from './Session';
import { SpamFilterRules } from './spam-filter/SpamFilterRules';
import {
    IWebSocketManager,
    NotificationChannel,
    NotificationChannelType,
} from '@dm3-org/dm3-lib-shared';

const SENDER_NAME = 'alice.eth';
const RECEIVER_NAME = 'bob.eth';
const SENDER_ADDRESS = '0x25A643B6e52864d0eD816F1E43c0CF49C83B8292';
const RECEIVER_ADDRESS = '0xDd36ae7F9a8E34FACf1e110c6e9d37D0dc917855';

const keysA = {
    encryptionKeyPair: {
        publicKey: 'eHmMq29FeiPKfNPkSctPuZGXvV0sKeO/KZkX2nXvMgw=',
        privateKey: 'pMI77F2w3GK+omZCB4A61WDqISOOnWGXR2f/MTLbqbY=',
    },
    signingKeyPair: {
        publicKey: '+tkDQWZfv9ixBmObsf8tgTHTZajwAE9muTtFAUj2e9I=',
        privateKey:
            '+DpeBjCzICFoi743/466yJunsHR55Bhr3GnqcS4cuJX62QNBZl+/2LEGY5ux/y2BMdNlqPAAT2a5O0UBSPZ70g==',
    },
    storageEncryptionKey: '+DpeBjCzICFoi743/466yJunsHR55Bhr3GnqcS4cuJU=',
    storageEncryptionNonce: 0,
};

const keysB = {
    encryptionKeyPair: {
        publicKey: 'GYZ1ZQZvyGyHb28CcAb2Ttq+Q1FV//pSaXRurAAUJgg=',
        privateKey: 'OVZDqoByMGbEzhxdHcTurzpEwxxP2/1EMiNUx+ST5g4=',
    },
    signingKeyPair: {
        publicKey: '7mTFDrawl87je1NNnRhYEoV4tGVXhHlTPcadloqivm0=',
        privateKey:
            '+DpeBjCzICFoi743/466yJunsHR55Bhr3GnqcS4cuJbuZMUOtrCXzuN7U02dGFgShXi0ZVeEeVM9xp2WiqK+bQ==',
    },
    storageEncryptionKey: '+DpeBjCzICFoi743/466yJunsHR55Bhr3GnqcS4cuJY=',
    storageEncryptionNonce: 0,
};

const getSession = async (
    ensName: string,
    socketId?: string,
): Promise<(Session & { spamFilterRules: SpamFilterRules }) | null> => {
    const emptyProfile: UserProfile = {
        publicSigningKey: '',
        publicEncryptionKey: '',
        deliveryServices: [''],
    };
    const isSender = normalizeEnsName(ensName) === SENDER_NAME;
    const isReceiver = normalizeEnsName(ensName) === RECEIVER_NAME;

    const session = (
        account: string,
        token: string,
        profile: UserProfile,
    ): Session => ({
        account,
        signedUserProfile: {
            profile,
            signature: '',
        },
        token,
        createdAt: new Date().getTime(),
        profileExtension: {
            encryptionAlgorithm: [],
            notSupportedMessageTypes: [],
        },
        socketId,
    });

    if (isSender) {
        return {
            ...session(SENDER_NAME, '123', emptyProfile),
            spamFilterRules: {},
        };
    }

    if (isReceiver) {
        return {
            ...session(RECEIVER_NAME, 'abc', {
                ...emptyProfile,
                publicEncryptionKey: keysB.encryptionKeyPair.publicKey,
            }),
            spamFilterRules: {},
        };
    }

    return null;
};

const getNotificationChannels = (user: string) => {
    return Promise.resolve([]);
};
jest.mock('nodemailer');

const sendMailMock = jest.fn();

const nodemailer = require('nodemailer'); //doesn't work with import. idk why
nodemailer.createTransport.mockReturnValue({
    sendMail: sendMailMock,
    close: () => {},
});

describe('Messages', () => {
    describe('incomingMessage', () => {
        it('rejctes an incoming message if the token is not valid', async () => {
            const storeNewMessage = async (
                conversationId: string,
                envelop: EncryptionEnvelop,
            ) => {};

            const mockWsManager: IWebSocketManager = {
                isConnected: function (ensName: string): Promise<boolean> {
                    return Promise.resolve(false);
                },
            };

            expect.assertions(1);

            await expect(() =>
                incomingMessage(
                    {
                        envelop: {
                            message: '',
                            metadata: {
                                version: '',
                                encryptionScheme: 'x25519-chacha20-poly1305',
                                deliveryInformation: stringify(
                                    testData.deliveryInformation,
                                ),
                                encryptedMessageHash: '',
                                signature: '',
                            },
                        },
                        token: 'abc',
                    },
                    keysA.signingKeyPair,
                    keysA.encryptionKeyPair,
                    2 ** 14,
                    [],
                    getSession,
                    storeNewMessage,
                    () => {},
                    {
                        resolveName: async () =>
                            '0x25A643B6e52864d0eD816F1E43c0CF49C83B8292',
                    } as any,
                    async () => '',
                    getNotificationChannels,
                    mockWsManager,
                ),
            ).rejects.toEqual(Error('Token check failed'));
        });

        it('rejects an incoming message if it is to large', async () => {
            const storeNewMessage = async (
                conversationId: string,
                envelop: EncryptionEnvelop,
            ) => {};

            const mockWsManager: IWebSocketManager = {
                isConnected: function (ensName: string): Promise<boolean> {
                    return Promise.resolve(false);
                },
            };

            expect.assertions(1);

            await expect(() =>
                incomingMessage(
                    {
                        envelop: {
                            metadata: {
                                encryptionScheme: 'x25519-chacha20-poly1305',
                                deliveryInformation: '',
                                encryptedMessageHash: '',
                                signature: '',
                                version: '',
                            },
                            message: '',
                        },
                        token: '123',
                    },
                    keysA.signingKeyPair,
                    keysA.encryptionKeyPair,
                    1,
                    [],
                    getSession,
                    storeNewMessage,
                    () => {},
                    {} as ethers.providers.JsonRpcProvider,
                    async () => '',
                    getNotificationChannels,
                    mockWsManager,
                ),
            ).rejects.toEqual(Error('Message is too large'));
        });
        it('rejects an incoming message if the receiver is unknown ', async () => {
            const storeNewMessage = async (
                conversationId: string,
                envelop: EncryptionEnvelop,
            ) => {};

            const mockWsManager: IWebSocketManager = {
                isConnected: function (ensName: string): Promise<boolean> {
                    return Promise.resolve(false);
                },
            };

            expect.assertions(1);

            await expect(() =>
                incomingMessage(
                    {
                        envelop: {
                            message: '',
                            metadata: {
                                encryptionScheme: 'x25519-chacha20-poly1305',
                                version: '',
                                encryptedMessageHash: '',
                                signature: '',
                                deliveryInformation: stringify(
                                    testData.deliveryInformationB,
                                ),
                            },
                        },
                        token: '123',
                    },
                    keysA.signingKeyPair,
                    keysA.encryptionKeyPair,
                    2 ** 14,
                    [],
                    getSession,
                    storeNewMessage,
                    () => {},
                    {
                        resolveName: async () =>
                            '0x25A643B6e52864d0eD816F1E43c0CF49C83B8292',
                    } as any,
                    async () => '',
                    getNotificationChannels,
                    mockWsManager,
                ),
            ).rejects.toEqual(Error('unknown session'));
        });
        //TODO remove skip once spam-filter is implemented
        it.skip('rejects message if the senders nonce is below the threshold', async () => {
            //Mock the time so we can test the message with the incomming timestamp
            jest.useFakeTimers().setSystemTime(new Date('2020-01-01'));

            let messageContainer: {
                conversationId?: string;
                envelop?: EncryptionEnvelop;
            } = {};

            const session = async (address: string) =>
                ({
                    ...(await getSession(address)),
                    spamFilterRules: { minNonce: 2 },
                } as Session & { spamFilterRules: SpamFilterRules });

            const provider = {
                getTransactionCount: async (_: string) => Promise.resolve(0),
                resolveName: async () =>
                    '0x25A643B6e52864d0eD816F1E43c0CF49C83B8292',
            } as any;

            const storeNewMessage = async (
                conversationId: string,
                envelop: EncryptionEnvelop,
            ) => {
                messageContainer = { conversationId, envelop };
            };

            const mockWsManager: IWebSocketManager = {
                isConnected: function (ensName: string): Promise<boolean> {
                    return Promise.resolve(false);
                },
            };

            try {
                await incomingMessage(
                    {
                        envelop: {
                            message: '',
                            metadata: {
                                encryptionScheme: 'x25519-chacha20-poly1305',
                                encryptedMessageHash: '',
                                signature: '',
                                version: '',
                                deliveryInformation: stringify(
                                    testData.deliveryInformation,
                                ),
                            },
                        },
                        token: '123',
                    },
                    keysA.signingKeyPair,
                    keysA.encryptionKeyPair,
                    2 ** 14,
                    [],
                    session,
                    storeNewMessage,
                    () => {},
                    provider,
                    async () => '',
                    getNotificationChannels,
                    mockWsManager,
                );
                fail();
            } catch (err: any) {
                expect(err.message).toBe(
                    'Message does not match spam criteria',
                );
            }
        });
        it('rejects message if the senders eth balance is below the threshold', async () => {
            //Mock the time so we can test the message with the incomming timestamp
            jest.useFakeTimers().setSystemTime(new Date('2020-01-01'));

            let messageContainer: {
                conversationId?: string;
                envelop?: EncryptionEnvelop;
            } = {};

            const session = async (address: string) =>
                ({
                    ...(await getSession(address)),
                    spamFilterRules: { minBalance: '0xa' },
                } as Session & { spamFilterRules: SpamFilterRules });

            const provider = {
                getBalance: async (_: string) =>
                    Promise.resolve(BigNumber.from(5)),
                resolveName: async () =>
                    '0x25A643B6e52864d0eD816F1E43c0CF49C83B8292',
            } as any;

            const storeNewMessage = async (
                conversationId: string,
                envelop: EncryptionEnvelop,
            ) => {
                messageContainer = { conversationId, envelop };
            };

            const mockWsManager: IWebSocketManager = {
                isConnected: function (ensName: string): Promise<boolean> {
                    return Promise.resolve(false);
                },
            };

            try {
                await incomingMessage(
                    {
                        envelop: {
                            message: '',
                            metadata: {
                                encryptionScheme: 'x25519-chacha20-poly1305',
                                version: '',
                                encryptedMessageHash: '',
                                signature: '',
                                deliveryInformation: stringify(
                                    testData.deliveryInformation,
                                ),
                            },
                        },
                        token: '123',
                    },
                    keysA.signingKeyPair,
                    keysA.encryptionKeyPair,
                    2 ** 14,
                    [],
                    session,
                    storeNewMessage,
                    () => {},
                    provider,
                    async () => '',
                    getNotificationChannels,
                    mockWsManager,
                );
                fail();
            } catch (err: any) {
                expect(err.message).toBe(
                    'Message does not match spam criteria',
                );
            }
        });
        //TODO remove skip once spam-filter is implemented
        it.skip('rejects message if the senders token balance is below the threshold', async () => {
            //Mock the time so we can test the message with the incomming timestamp
            jest.useFakeTimers().setSystemTime(new Date('2020-01-01'));

            let messageContainer: {
                conversationId?: string;
                envelop?: EncryptionEnvelop;
            } = {};

            const session = async (address: string) =>
                ({
                    ...(await getSession(address)),
                    spamFilterRules: {
                        minTokenBalance: {
                            address:
                                '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
                            amount: '0xa',
                        },
                    },
                } as Session & { spamFilterRules: SpamFilterRules });

            const provider = {
                _isProvider: true,
                call: () => Promise.resolve(BigNumber.from(0).toHexString()),
                resolveName: async () =>
                    '0x25A643B6e52864d0eD816F1E43c0CF49C83B8292',
            } as unknown as ethers.providers.JsonRpcProvider;

            const storeNewMessage = async (
                conversationId: string,
                envelop: EncryptionEnvelop,
            ) => {
                messageContainer = { conversationId, envelop };
            };

            const mockWsManager: IWebSocketManager = {
                isConnected: function (ensName: string): Promise<boolean> {
                    return Promise.resolve(false);
                },
            };

            try {
                await incomingMessage(
                    {
                        envelop: {
                            message: '',
                            metadata: {
                                encryptionScheme: 'x25519-chacha20-poly1305',
                                deliveryInformation: stringify(
                                    testData.deliveryInformation,
                                ),

                                version: '',
                                encryptedMessageHash: '',
                                signature: '',
                            },
                        },
                        token: '123',
                    },
                    keysA.signingKeyPair,
                    keysA.encryptionKeyPair,
                    2 ** 14,
                    [],
                    session,
                    storeNewMessage,
                    () => {},
                    provider,
                    async () => '',
                    getNotificationChannels,
                    mockWsManager,
                );
                fail();
            } catch (err: any) {
                expect(err.message).toBe(
                    'Message does not match spam criteria',
                );
            }
        });

        it('send mail after incoming message', async () => {
            //Value stored at config
            let messageContainer: {
                conversationId?: string;
                envelop?: EncryptionEnvelop;
            } = {};

            const storeNewMessage = async (
                conversationId: string,
                envelop: EncryptionEnvelop,
            ) => {
                messageContainer = { conversationId, envelop };
            };

            const sendMessageViaSocketMock = jest.fn();

            const getNotificationChannels = (user: string) => {
                return Promise.resolve([
                    {
                        type: NotificationChannelType.EMAIL,
                        config: {
                            recipientEmailId: 'joe12345@gmail.com',
                            isVerified: true,
                            isEnabled: true,
                        },
                    },
                ]);
            };

            const dsNotificationChannels: NotificationChannel[] = [
                {
                    type: NotificationChannelType.EMAIL,
                    config: {
                        smtpHost: 'smtp.gmail.com',
                        smtpPort: 587,
                        smtpEmail: 'abc@gmail.com',
                        smtpUsername: 'abc@gmail.com',
                        smtpPassword: 'abcd1234',
                    },
                },
            ];

            const mockWsManager: IWebSocketManager = {
                isConnected: function (ensName: string): Promise<boolean> {
                    return Promise.resolve(false);
                },
            };

            await incomingMessage(
                {
                    envelop: {
                        message: '',
                        metadata: {
                            version: '',
                            encryptedMessageHash: '',
                            signature: '',
                            encryptionScheme: 'x25519-chacha20-poly1305',
                            deliveryInformation: stringify(
                                testData.deliveryInformation,
                            ),
                        },
                    },
                    token: '123',
                },
                keysA.signingKeyPair,
                keysA.encryptionKeyPair,
                2 ** 14,
                dsNotificationChannels,
                getSession,
                storeNewMessage,
                sendMessageViaSocketMock,
                {
                    resolveName: async () =>
                        '0x25A643B6e52864d0eD816F1E43c0CF49C83B8292',
                } as any,
                async (ensName) => ensName,
                getNotificationChannels,
                mockWsManager,
            );

            expect(sendMailMock).toHaveBeenCalled();

            //Check if the message was submitted to the socket
            expect(sendMessageViaSocketMock).not.toBeCalled();
        });
        it('stores proper incoming message', async () => {
            //Mock the time so we can test the message with the incomming timestamp
            jest.useFakeTimers().setSystemTime(new Date('2020-01-01'));

            //Value stored at config

            let messageContainer: {
                conversationId?: string;
                envelop?: EncryptionEnvelop;
            } = {};

            const storeNewMessage = async (
                conversationId: string,
                envelop: EncryptionEnvelop,
            ) => {
                messageContainer = { conversationId, envelop };
            };

            const sendMock = jest.fn();

            const mockWsManager: IWebSocketManager = {
                isConnected: function (ensName: string): Promise<boolean> {
                    return Promise.resolve(false);
                },
            };

            await incomingMessage(
                {
                    envelop: {
                        message: '',
                        metadata: {
                            version: '',
                            encryptedMessageHash: '',
                            signature: '',
                            encryptionScheme: 'x25519-chacha20-poly1305',
                            deliveryInformation: stringify(
                                testData.deliveryInformation,
                            ),
                        },
                    },
                    token: '123',
                },
                keysA.signingKeyPair,
                keysA.encryptionKeyPair,
                2 ** 14,
                [],
                getSession,
                storeNewMessage,
                sendMock,
                {
                    resolveName: async () =>
                        '0x25A643B6e52864d0eD816F1E43c0CF49C83B8292',
                } as any,
                async (ensName) => ensName,
                getNotificationChannels,
                mockWsManager,
            );

            const conversationId = getConversationId('alice.eth', 'bob.eth');

            const actualPostmark = await decryptAsymmetric(
                keysB.encryptionKeyPair,
                JSON.parse(messageContainer.envelop?.postmark!),
            );

            //Check message
            expect(messageContainer.conversationId).toEqual(conversationId);

            expect(messageContainer.envelop).toEqual(
                expect.objectContaining({
                    message: '',
                    metadata: {
                        version: '',
                        encryptedMessageHash: '',
                        signature: '',
                        encryptionScheme: 'x25519-chacha20-poly1305',
                        deliveryInformation: {
                            from: 'alice.eth',
                            to: 'bob.eth',
                        },
                    },
                }),
            );

            //Check Postmark
            expect(JSON.parse(actualPostmark)).toStrictEqual({
                incommingTimestamp: 1577836800000,
                messageHash:
                    '0xd7c617eb7ffee435e7d4e7f6b13d46ccdf88d2e5463148c50659e5cd88d248b5',
                signature:
                    'lEsyB5CPB/AtOgY1rbeyjRQ8u1jaKHyOStrBiRmWT6IpRM/vPNOBU+IUU5FWLZl2v5WC+/aA7+tkflblGHvWDQ==',
            });
            //Check if the message was submitted to the socket
            expect(sendMock).not.toBeCalled();
        });

        it('stores proper incoming message and submit it if receiver is connected to a socket', async () => {
            //Mock the time so we can test the message with the incomming timestamp
            jest.useFakeTimers().setSystemTime(new Date('2020-01-01'));

            let messageContainer: {
                conversationId?: string;
                envelop?: EncryptionEnvelop;
            } = {};

            const storeNewMessage = async (
                conversationId: string,
                envelop: EncryptionEnvelop,
            ) => {
                messageContainer = { conversationId, envelop };
            };

            const sendMock = jest.fn();

            const _getSession = (address: string) => getSession(address, 'foo');

            const mockWsManager: IWebSocketManager = {
                isConnected: function (ensName: string): Promise<boolean> {
                    return Promise.resolve(true);
                },
            };

            await incomingMessage(
                {
                    envelop: {
                        message: '',
                        metadata: {
                            encryptionScheme: 'x25519-chacha20-poly1305',
                            deliveryInformation: stringify(
                                testData.deliveryInformation,
                            ),
                            version: '',
                            encryptedMessageHash: '',
                            signature: '',
                        },
                    },
                    token: '123',
                },
                keysA.signingKeyPair,
                keysA.encryptionKeyPair,
                2 ** 14,
                [],
                _getSession,
                storeNewMessage,
                sendMock,
                {
                    resolveName: async () =>
                        '0x25A643B6e52864d0eD816F1E43c0CF49C83B8292',
                } as any,
                async (ensName) => ensName,
                getNotificationChannels,
                mockWsManager,
            );

            const conversationId = getConversationId('alice.eth', 'bob.eth');

            const actualPostmark = await decryptAsymmetric(
                keysB.encryptionKeyPair,
                JSON.parse(messageContainer.envelop?.postmark!),
            );

            //Check message
            expect(messageContainer.conversationId).toEqual(conversationId);

            expect(messageContainer.envelop).toEqual(
                expect.objectContaining({
                    message: '',
                    metadata: {
                        encryptionScheme: 'x25519-chacha20-poly1305',
                        deliveryInformation: {
                            from: 'alice.eth',
                            to: 'bob.eth',
                        },
                        version: '',
                        encryptedMessageHash: '',
                        signature: '',
                    },
                }),
            );

            //Check Postmark
            expect(JSON.parse(actualPostmark)).toStrictEqual({
                incommingTimestamp: 1577836800000,
                messageHash:
                    '0xd7c617eb7ffee435e7d4e7f6b13d46ccdf88d2e5463148c50659e5cd88d248b5',
                signature:
                    'lEsyB5CPB/AtOgY1rbeyjRQ8u1jaKHyOStrBiRmWT6IpRM/vPNOBU+IUU5FWLZl2v5WC+/aA7+tkflblGHvWDQ==',
            });
            //Check if the message was submitted to the socket
            expect(sendMock).toBeCalled();
        });
    });

    describe('GetMessages', () => {
        it('returns all messages of the user', async () => {
            const conversationIdToUse = getConversationId(
                'alice.eth',
                'bob.eth',
            );

            const loadMessages = async (
                conversationId: string,
                offset: number,
                size: number,
            ): Promise<EncryptionEnvelop[]> => {
                return conversationId === conversationIdToUse
                    ? ([
                          {
                              message: '',
                              metadata: {
                                  encryptionScheme: 'x25519-chacha20-poly1305',
                                  deliveryInformation:
                                      testData.deliveryInformationUnecrypted,
                                  version: '',
                                  encryptedMessageHash: '',
                                  signature: '',
                              },
                          },
                          {
                              message: '',
                              metadata: {
                                  encryptionScheme: 'x25519-chacha20-poly1305',
                                  deliveryInformation:
                                      testData.deliveryInformationUnecrypted,
                                  version: '',
                                  encryptedMessageHash: '',
                                  signature: '',
                              },
                          },
                          {
                              message: '',
                              metadata: {
                                  encryptionScheme: 'x25519-chacha20-poly1305',
                                  deliveryInformation:
                                      testData.delvieryInformationBUnecrypted,
                                  version: '',
                                  encryptedMessageHash: '',
                                  signature: '',
                              },
                          },
                      ] as EncryptionEnvelop[])
                    : [];
            };

            expect(
                await getMessages(
                    loadMessages,
                    keysA.encryptionKeyPair,
                    'bob.eth',
                    'alice.eth',
                ),
            ).toStrictEqual([
                {
                    message: '',
                    metadata: {
                        encryptionScheme: 'x25519-chacha20-poly1305',
                        deliveryInformation:
                            testData.deliveryInformationUnecrypted,
                        encryptedMessageHash: '',
                        signature: '',
                        version: '',
                    },
                },
                {
                    message: '',
                    metadata: {
                        encryptionScheme: 'x25519-chacha20-poly1305',
                        deliveryInformation:
                            testData.deliveryInformationUnecrypted,
                        version: '',
                        encryptedMessageHash: '',
                        signature: '',
                    },
                },
            ]);
        });
    });
});
