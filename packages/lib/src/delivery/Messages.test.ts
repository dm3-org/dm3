import { assert } from 'console';
import { BigNumber, ethers } from 'ethers';
import { UserProfile } from '../account/Account';
import { decryptAsymmetric } from '../crypto';
import { formatAddress } from '../external-apis/InjectedWeb3API';
import { EncryptionEnvelop } from '../messaging/Envelop';
import { stringify } from '../shared/stringify';
import { getConversationId } from '../storage/Storage';
import { getMessages, incomingMessage } from './Messages';
import { testData } from '../../../../test-data/encrypted-envelops.test';
import { Session } from './Session';

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

const getSession = async (address: string, socketId?: string) => {
    const emptyProfile: UserProfile = {
        publicSigningKey: '',
        publicEncryptionKey: '',
        deliveryServices: [''],
    };
    const isSender = formatAddress(address) === SENDER_ADDRESS;
    const isReceiver = formatAddress(address) === RECEIVER_ADDRESS;

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
        return session(SENDER_ADDRESS, '123', emptyProfile);
    }

    if (isReceiver) {
        return session(RECEIVER_ADDRESS, 'abc', {
            ...emptyProfile,
            publicEncryptionKey: keysB.encryptionKeyPair.publicKey,
        });
    }

    return null;
};

describe('Messages', () => {
    describe('incomingMessage', () => {
        it('rejctes an incoming message if the token is not valid', async () => {
            const storeNewMessage = async (
                conversationId: string,
                envelop: EncryptionEnvelop,
            ) => {};

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
                    getSession,
                    storeNewMessage,
                    () => {},
                    {} as ethers.providers.BaseProvider,
                ),
            ).rejects.toEqual(Error('Token check failed'));
        });
        it('rejects an incoming message if it is to large', async () => {
            const storeNewMessage = async (
                conversationId: string,
                envelop: EncryptionEnvelop,
            ) => {};

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
                    getSession,
                    storeNewMessage,
                    () => {},
                    {} as ethers.providers.BaseProvider,
                ),
            ).rejects.toEqual(Error('Message is too large'));
        });
        it('rejects an incoming message if the receiver is unknown ', async () => {
            const storeNewMessage = async (
                conversationId: string,
                envelop: EncryptionEnvelop,
            ) => {};

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
                        token: 'abc',
                    },
                    keysA.signingKeyPair,
                    keysA.encryptionKeyPair,
                    2 ** 14,
                    getSession,
                    storeNewMessage,
                    () => {},
                    {} as ethers.providers.BaseProvider,
                ),
            ).rejects.toEqual(Error('unknown session'));
        });
        it('rejects message if the senders nonce is below the threshold', async () => {
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
                } as Session);

            const provider = {
                getTransactionCount: async (_: string) => Promise.resolve(0),
            } as ethers.providers.BaseProvider;

            const storeNewMessage = async (
                conversationId: string,
                envelop: EncryptionEnvelop,
            ) => {
                messageContainer = { conversationId, envelop };
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
                    session,
                    storeNewMessage,
                    () => {},
                    provider,
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
                } as Session);

            const provider = {
                getBalance: async (_: string) =>
                    Promise.resolve(BigNumber.from(5)),
            } as ethers.providers.BaseProvider;

            const storeNewMessage = async (
                conversationId: string,
                envelop: EncryptionEnvelop,
            ) => {
                messageContainer = { conversationId, envelop };
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
                    session,
                    storeNewMessage,
                    () => {},
                    provider,
                );
                fail();
            } catch (err: any) {
                expect(err.message).toBe(
                    'Message does not match spam criteria',
                );
            }
        });
        it('rejects message if the senders token balance is below the threshold', async () => {
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
                } as Session);

            const provider = {
                _isProvider: true,
                call: () => Promise.resolve(BigNumber.from(0).toHexString()),
            } as unknown as ethers.providers.BaseProvider;

            const storeNewMessage = async (
                conversationId: string,
                envelop: EncryptionEnvelop,
            ) => {
                messageContainer = { conversationId, envelop };
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
                    session,
                    storeNewMessage,
                    () => {},
                    provider,
                );
                fail();
            } catch (err: any) {
                expect(err.message).toBe(
                    'Message does not match spam criteria',
                );
            }
        });
        it('stores proper incoming message', async () => {
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
                getSession,
                storeNewMessage,
                sendMock,
                {} as ethers.providers.BaseProvider,
            );

            const conversationId = getConversationId(
                '0x25A643B6e52864d0eD816F1E43c0CF49C83B8292',
                '0xDd36ae7F9a8E34FACf1e110c6e9d37D0dc917855',
            );

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
                        deliveryInformation: stringify(
                            testData.deliveryInformation,
                        ),
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
                _getSession,
                storeNewMessage,
                sendMock,
                {} as ethers.providers.BaseProvider,
            );

            const conversationId = getConversationId(
                '0x25A643B6e52864d0eD816F1E43c0CF49C83B8292',
                '0xDd36ae7F9a8E34FACf1e110c6e9d37D0dc917855',
            );

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
                        deliveryInformation: stringify(
                            testData.deliveryInformation,
                        ),
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
                '0x25A643B6e52864d0eD816F1E43c0CF49C83B8292',
                '0xDd36ae7F9a8E34FACf1e110c6e9d37D0dc917855',
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
                                  deliveryInformation: stringify(
                                      testData.deliveryInformation,
                                  ),
                                  version: '',
                                  encryptedMessageHash: '',
                                  signature: '',
                              },
                          },
                          {
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
                          {
                              message: '',
                              metadata: {
                                  encryptionScheme: 'x25519-chacha20-poly1305',
                                  deliveryInformation: stringify(
                                      testData.deliveryInformationB,
                                  ),
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
                    '0xDd36ae7F9a8E34FACf1e110c6e9d37D0dc917855',
                    '0x25A643B6e52864d0eD816F1E43c0CF49C83B8292',
                ),
            ).toStrictEqual([
                {
                    message: '',
                    metadata: {
                        encryptionScheme: 'x25519-chacha20-poly1305',
                        deliveryInformation: stringify(
                            testData.deliveryInformation,
                        ),
                        encryptedMessageHash: '',
                        signature: '',
                        version: '',
                    },
                },
                {
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
            ]);
        });
    });
});
