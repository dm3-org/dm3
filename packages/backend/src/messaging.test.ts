import express from 'express';
import { Socket } from 'socket.io';
import { onConnection } from './messaging';
import { testData } from '../../../test-data/encrypted-envelops.test';
import { WithLocals } from './types';
import { Session } from 'dm3-lib-delivery/dist.backend';
import { UserProfile } from 'dm3-lib-profile/dist.backend';
import { createKeyPair } from 'dm3-lib-crypto/dist.backend';
import { ethersHelper } from 'dm3-lib-shared/dist.backend';
const SENDER_ADDRESS = '0x25A643B6e52864d0eD816F1E43c0CF49C83B8292';
const RECEIVER_ADDRESS = '0xDd36ae7F9a8E34FACf1e110c6e9d37D0dc917855';

// eslint-disable-next-line no-console
const log = (toLog: any) => console.log(toLog);

const logger = {
    warn: log,
    info: log,
};

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

const keyPair = createKeyPair();

describe('Messaging', () => {
    describe('submitMessage', () => {
        it('returns success if schema is valid', (done: any) => {
            //We expect the callback functions called once witht he value 'success'
            expect.assertions(1);
            const callback = (e: any) => {
                // eslint-disable-next-line max-len
                //Even though the method fails jest dosen't recognize it becuase of the catch block used in messaging.ts. So we have to throw another error if the callback returns anything else then the expected result.
                if (e.response !== 'success') {
                    throw Error(e);
                }
                expect(e.response).toBe('success');
                done();
            };
            //We provide an mocked express app with all needes locals vars
            const app = {
                locals: {
                    logger,
                    keys: {
                        signing: keysA.signingKeyPair,
                        encryption: keysA.encryptionKeyPair,
                    },

                    deliveryServiceProperties: { sizeLimit: 2 ** 14 },
                    web3Provider: {
                        resolveName: async () =>
                            '0x25A643B6e52864d0eD816F1E43c0CF49C83B8292',
                    },

                    db: {
                        getSession,
                        createMessage: () => {},
                        getIdEnsName: async (ensName: string) => ensName,
                    },
                    redisClient: {
                        zAdd: () => {},
                    },
                    io: {
                        sockets: {
                            to: (_: any) => ({
                                emit: (_: any, __any: any) => {},
                            }),
                        },
                    },
                } as any,
            } as express.Express & WithLocals;

            //The same data used in Messages.test
            const data = {
                envelop: testData.envelopA,
                token: '123',
            };

            const getSocketMock = () => {
                return {
                    on: async (name: string, onSubmitMessage: any) => {
                        //We just want to test the submitMessage callback fn
                        if (name === 'submitMessage') {
                            await onSubmitMessage(data, callback);
                        }
                    },
                } as unknown as Socket;
            };

            onConnection(app)(getSocketMock());
        });
        //TODO remove skip once spam-filter is implemented
        it.skip('returns error if message is spam', (done: any) => {
            //We expect the callback functions called once witht he value 'success'
            expect.assertions(1);
            const callback = jest.fn((e: any) => {
                // eslint-disable-next-line max-len
                //Even though the method fails jest dosen't recognize it becuase of the catch block used in messaging.ts. So we have to throw another error if the callback returns anything else then the expected result.
                if (e.error !== 'Message does not match spam criteria') {
                    throw Error(e);
                }
                expect(e.error).toBe('Message does not match spam criteria');
                done();
            });
            const session = async (addr: string) => {
                return {
                    ...(await getSession(addr)),
                    spamFilterRules: { minNonce: 2 },
                } as Session;
            };
            //We provide an mocked express app with all needes locals vars

            const app = {
                locals: {
                    logger,
                    keys: {
                        signing: keysA.signingKeyPair,
                        encryption: keysA.encryptionKeyPair,
                    },

                    deliveryServiceProperties: { sizeLimit: 2 ** 14 },

                    db: {
                        getSession: session,
                        createMessage: () => {},
                        getIdEnsName: async (ensName: string) => ensName,
                    },
                    web3Provider: {
                        getTransactionCount: (_: string) => Promise.resolve(0),
                        resolveName: async () =>
                            '0x25A643B6e52864d0eD816F1E43c0CF49C83B8292',
                    },
                    redisClient: {
                        zAdd: () => {},
                    },
                    io: {
                        sockets: {
                            to: (_: any) => ({
                                emit: (_: any, __any: any) => {},
                            }),
                        },
                    },
                } as any,
            } as express.Express & WithLocals;

            //The same data used in Messages.test
            const data = {
                envelop: testData.envelopA,
                token: '123',
            };

            const getSocketMock = () => {
                return {
                    on: async (name: string, onSubmitMessage: any) => {
                        //We just want to test the submitMessage callback fn
                        if (name === 'submitMessage') {
                            await onSubmitMessage(data, callback);
                        }
                    },
                } as unknown as Socket;
            };

            onConnection(app)(getSocketMock());
        });
        it('Throws error if schema is invalid', async () => {
            //We expect the callback functions called once witht he value 'success'
            expect.assertions(1);
            const callback = jest.fn((e: any) => {
                // eslint-disable-next-line max-len
                //Even though the method fails jest dosen't recognize it becuase of the catch block used in messaging.ts. So we have to throw another error if the callback returns anything else then the expected result.
                if (e.error !== 'invalid schema') {
                    throw Error(e);
                }
                expect(e.error).toBe('invalid schema');
            });
            //We provide an mocked express app with all needes locals vars
            const app = {
                locals: {
                    logger,
                    deliveryServicePrivateKey:
                        '9SZhajjn9tn0fX/eBMXfZfb0RaUeYyfhlNYHqZyKHpyTiYvwVosQ5qt2XxdDFblTzggir8kp85kWw76p2EZ0rQ==',
                    redisClient: {
                        zAdd: () => {},
                    },
                    io: {
                        sockets: {
                            to: (_: any) => ({
                                emit: (_: any, __any: any) => {},
                            }),
                        },
                    },
                    db: {
                        getSession,
                        getIdEnsName: async (ensName: string) => ensName,
                    },
                } as any,
            } as express.Express & WithLocals;

            //The same data used in Messages.test
            const data = {
                envelop: {
                    foo: 'bar',
                },
                token: '123',
            };

            const getSocketMock = jest.fn(() => {
                return {
                    on: async (name: string, onSubmitMessage: any) => {
                        //We just want to test the submitMessage callback fn
                        if (name === 'submitMessage') {
                            await onSubmitMessage(data, callback);
                        }
                    },
                } as unknown as Socket;
            });

            await onConnection(app)(getSocketMock());
        });
    });

    describe('pendingMessage', () => {
        it('returns error if schema is invalid', async () => {
            const app = {
                locals: {
                    logger,
                } as any,
            } as express.Express & WithLocals;

            const data = {
                accountAddress: '',
                contactAddress: '',
            };

            const callback = jest.fn((e: any) => {
                if (e.error !== 'invalid schema') {
                    throw Error(e);
                }
                expect(e.error).toBe('invalid schema');
            });

            const getSocketMock = jest.fn(() => {
                return {
                    on: async (name: string, onPendingMessage: any) => {
                        //We just want to test the submitMessage callback fn
                        if (name === 'pendingMessage') {
                            await onPendingMessage(data, callback);
                        }
                    },
                } as unknown as Socket;
            });

            await onConnection(app)(getSocketMock());
        });
    });
});

const getSession = async (address: string) => {
    const emptyProfile: UserProfile = {
        publicSigningKey: '',
        publicEncryptionKey: '',
        deliveryServices: [''],
    };
    const isSender = ethersHelper.formatAddress(address) === SENDER_ADDRESS;
    const isReceiver = ethersHelper.formatAddress(address) === RECEIVER_ADDRESS;

    const session = (account: string, token: string, profile: UserProfile) => ({
        account,
        signedUserProfile: {
            profile,
            signature: '',
        },
        token,
    });

    if (isSender) {
        return session(SENDER_ADDRESS, '123', emptyProfile);
    }

    if (isReceiver) {
        return session(RECEIVER_ADDRESS, 'abc', {
            ...emptyProfile,
            publicEncryptionKey: (await keyPair).publicKey,
        });
    }

    return null;
};
