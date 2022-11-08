import bodyParser from 'body-parser';
import { delivery } from 'dm3-lib';

import express from 'express';
import { Socket } from 'socket.io';
import { onConnection } from './messaging';
import { socketAuth } from './utils';
import nacl from 'tweetnacl';
import { encodeBase64 } from 'tweetnacl-util';

import * as Lib from 'dm3-lib/dist.backend';

const SENDER_ADDRESS = '0x25A643B6e52864d0eD816F1E43c0CF49C83B8292';
const RECEIVER_ADDRESS = '0xDd36ae7F9a8E34FACf1e110c6e9d37D0dc917855';

const { publicKey } = nacl.box.keyPair();
const receiverPublicEncryptionKey = encodeBase64(publicKey);

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
        it('returns success if schema is valid', async () => {
            //We expect the callback functions called once witht he value 'success'
            expect.assertions(1);
            const callback = jest.fn((e: any) => {
                // eslint-disable-next-line max-len
                //Even though the method fails jest dosen't recognize it becuase of the catch block used in messaging.ts. So we have to throw another error if the callback returns anything else then the expected result.
                if (e !== 'success') {
                    throw Error(e);
                }
                expect(e).toBe('success');
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
                    loadSession,
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
                envelop: {
                    encryptedData: '',
                    encryptionVersion: 'x25519-xsalsa20-poly1305',
                    from: SENDER_ADDRESS,
                    to: RECEIVER_ADDRESS,
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
        it('Throws error if schema is invalid', async () => {
            //We expect the callback functions called once witht he value 'success'
            expect.assertions(1);
            const callback = jest.fn((e: any) => {
                // eslint-disable-next-line max-len
                //Even though the method fails jest dosen't recognize it becuase of the catch block used in messaging.ts. So we have to throw another error if the callback returns anything else then the expected result.
                if (e !== 'invalid schema') {
                    throw Error(e);
                }
                expect(e).toBe('invalid schema');
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
                    loadSession,
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
                if (e !== 'invalid schema') {
                    throw Error(e);
                }
                expect(e).toBe('invalid schema');
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

const loadSession = async (address: string) => {
    const emptyProfile: Lib.account.UserProfile = {
        publicSigningKey: '',
        publicEncryptionKey: '',
        deliveryServices: [''],
    };
    const isSender = Lib.external.formatAddress(address) === SENDER_ADDRESS;
    const isReceiver = Lib.external.formatAddress(address) === RECEIVER_ADDRESS;

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
            publicEncryptionKey: receiverPublicEncryptionKey,
        });
    }

    return null;
};
