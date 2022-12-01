import express from 'express';
import { Socket } from 'socket.io';
import { onConnection } from './messaging';
import { socketAuth } from './utils';
import * as testData from './messaging.test.json';

import * as Lib from 'dm3-lib/dist.backend';

const SENDER_ADDRESS = '0x25A643B6e52864d0eD816F1E43c0CF49C83B8292';
const RECEIVER_ADDRESS = '0xDd36ae7F9a8E34FACf1e110c6e9d37D0dc917855';

const keysA = {
    encryptionKeyPair: {
        publicKey:
            '0x78798cab6f457a23ca7cd3e449cb4fb99197bd5d2c29e3bf299917da75ef320c',
        privateKey:
            '0xa4c23bec5db0dc62bea2664207803ad560ea21238e9d61974767ff3132dba9b6',
    },
    signingKeyPair: {
        publicKey:
            '0xfad90341665fbfd8b106639bb1ff2d8131d365a8f0004f66b93b450148f67bd2',
        privateKey:
            '0xf83a5e0630b32021688bbe37ff8ebac89ba7b07479e4186bdc69ea712e1cb895' +
            'fad90341665fbfd8b106639bb1ff2d8131d365a8f0004f66b93b450148f67bd2',
    },
    storageEncryptionKey:
        '0xf83a5e0630b32021688bbe37ff8ebac89ba7b07479e4186bdc69ea712e1cb895',
    storageEncryptionNonce: 0,
};

const keyPair = Lib.crypto.createKeyPair();

describe('Messaging', () => {
    describe('socketAuth', () => {
        it('throws error if address is not a valid ethereum address', async () => {
            const app = {} as express.Express;

            const getSocketMock = jest.fn(() => {
                return {
                    handshake: { auth: { account: { address: 'foo' } } },
                } as unknown as Socket;
            });
            const next = jest.fn((e: any) => {
                expect(e.message).toBe('Invalid address');
            });

            await socketAuth(app)(getSocketMock(), next);
        });
    });
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
                    logger: {
                        warn: (e: any) => {
                            console.log(e);
                        },
                        info: (e: any) => {
                            console.log(e);
                        },
                    },
                    keys: {
                        signing: keysA.signingKeyPair,
                        encryption: keysA.encryptionKeyPair,
                    },

                    deliveryServiceProperties: { sizeLimit: 2 ** 14 },

                    db: { getSession, createMessage: () => {} },
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
            } as express.Express;

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
                    logger: {
                        warn: (e: any) => {
                            console.log(e);
                        },
                        info: (e: any) => {
                            console.log(e);
                        },
                    },
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
                    },
                } as any,
            } as express.Express;

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
                    logger: {
                        warn: (e: any) => {
                            console.log(e);
                        },
                        info: (e: any) => {
                            console.log(e);
                        },
                    },
                } as any,
            } as express.Express;

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
    const emptyProfile: Lib.account.UserProfile = {
        publicSigningKey: '',
        publicEncryptionKey: '',
        deliveryServices: [''],
    };
    const isSender = Lib.external.formatAddress(address) === SENDER_ADDRESS;
    const isReceiver = Lib.external.formatAddress(address) === RECEIVER_ADDRESS;

    const session = (
        account: string,
        token: string,
        profile: Lib.account.UserProfile,
    ) => ({
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
