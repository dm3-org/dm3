import express from 'express';
import { Socket } from 'socket.io';
import { onConnection } from './messaging';
import { testData } from '../../../test-data/encrypted-envelops.test';
import { Session } from '@dm3-org/dm3-lib-delivery';
import { UserProfile } from '@dm3-org/dm3-lib-profile';
import { createKeyPair } from '@dm3-org/dm3-lib-crypto';
import { ethersHelper } from '@dm3-org/dm3-lib-shared';
import winston from 'winston';
import { getWeb3Provider } from '../../lib/server-side/dist/utils';
const SENDER_ADDRESS = '0x25A643B6e52864d0eD816F1E43c0CF49C83B8292';
const RECEIVER_ADDRESS = '0xDd36ae7F9a8E34FACf1e110c6e9d37D0dc917855';

global.logger = winston.createLogger({
    transports: [new winston.transports.Console()],
});
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

describe('Messaging', () => {
    // prepare some mocks that are used by many tests
    const web3Provider = {
        resolveName: async () => '0x25A643B6e52864d0eD816F1E43c0CF49C83B8292',
    };
    const db = {
        getSession,
        createMessage: () => {},
        getIdEnsName: async (ensName: string) => ensName,
        getUsersNotificationChannels: () => Promise.resolve([]),
    };
    const io = {
        sockets: {
            to: (_: any) => ({
                emit: (_: any, __any: any) => {},
            }),
        },
    };
    //The same data used in Messages.test
    const data = {
        envelop: testData.envelopA,
        token: '123',
    };

    describe('submitMessage', () => {
        it('returns success if schema is valid', (done: any) => {
            //We expect the callback function to be called once with
            // the value 'success'
            expect.assertions(1);

            const callback = (e: any) => {
                // Even though the method fails jest doesn't recognize it because
                // of the catch block used in messaging.ts. So we have to throw
                // another error if the callback returns anything else then the expected
                // result.
                expect(e.response).toBe('success');
                done();
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

            onConnection(
                io as any,
                web3Provider as any,
                db as any,
                keysA,
            )(getSocketMock());
        });
        it.skip('returns error if message is spam', (done: any) => {
            //We expect the callback functions called once with the value 'success'
            expect.assertions(1);
            const callback = jest.fn((e: any) => {
                /*
                 * Even though the method fails jest dosen't recognize it because of the catch block
                 * used in messaging.ts. So we have to throw another error if the callback returns
                 * anything else then the expected result.
                 */
                expect(e.error).toBe('Message does not match spam criteria');
                done();
            });

            const session = async (addr: string) => {
                return {
                    ...(await getSession(addr)),
                    spamFilterRules: { minNonce: 2 },
                } as Session;
            };
            const db = {
                getSession: session,
                createMessage: () => {},
                getIdEnsName: async (ensName: string) => ensName,
                getUsersNotificationChannels: () => Promise.resolve([]),
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

            onConnection(
                io as any,
                web3Provider as any,
                db as any,
                keysA,
            )(getSocketMock());
        });
        it('Throws error if schema is invalid', async () => {
            expect.assertions(1);
            const callback = jest.fn((e: any) => {
                /**
                 * Even though the method fails jest dosen't recognize it because of the
                 * catch block used in messaging.ts. So we have to throw another error if
                 * the callback returns anything else then the expected result.
                 */
                expect(e.error).toBe('invalid schema');
            });

            const localData = { ...data };
            const metadata = localData.envelop.metadata as any;
            // Change the data so it becomes invalid in order to provoke the 'invalid schema' error
            delete metadata.deliveryInformation;
            localData.envelop.metadata = metadata;

            const getSocketMock = jest.fn(() => {
                return {
                    on: async (name: string, onSubmitMessage: any) => {
                        //We just want to test the submitMessage callback fn
                        if (name === 'submitMessage') {
                            await onSubmitMessage(localData, await callback);
                        }
                    },
                } as unknown as Socket;
            });

            onConnection(
                io as any,
                web3Provider as any,
                db as any,
                keysA,
            )(getSocketMock());
        });
    });

    describe('pendingMessage', () => {
        it('returns error if schema is invalid', async () => {
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
            onConnection(
                io as any,
                web3Provider as any,
                db as any,
                keysA,
            )(getSocketMock());
        });
    });
});
