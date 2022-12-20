import { Account } from '../account';
import { SignedUserProfile } from '../account/Account';
import { Acknoledgment } from '../delivery';
import { Envelop } from '../messaging';
import { Connection } from '../web3-provider/Web3Provider';
import {
    createPendingEntry,
    getChallenge,
    getNewMessages,
    getNewToken,
    getPendingConversations,
    getUserProfileOffChain,
    submitMessage,
    submitUserProfile,
    syncAcknoledgment,
} from './BackendAPI';

const SENDER_ADDRESS = '0x25A643B6e52864d0eD816F1E43c0CF49C83B8292';
const RECEIVER_ADDRESS = '0xDd36ae7F9a8E34FACf1e110c6e9d37D0dc917855';

jest.mock('../delivery/Delivery', () => ({
    getDeliveryServiceClient: jest.fn(() => ({
        get: (url: string) => {
            const [_, path] = url.split('/');
            switch (path) {
                case 'auth':
                    return {
                        data: {
                            challenge: 'my-challenge',
                        },
                    };
                case 'delivery':
                    return { data: [] };
                case 'profile':
                    return { data: { signature: 'bar' } };
            }
        },

        post: (url: string) => {
            const [_, path] = url.split('/');
            switch (path) {
                case 'auth':
                    return {
                        data: {
                            token: 'my-token',
                        },
                    };
                case 'profile':
                    return {
                        data: 'my-profile',
                    };
                case 'messages':
                    return {};
                case 'delivery':
                    return {
                        data: [],
                    };
            }
        },
    })),
}));
jest.mock('axios', () => ({
    get: () => ({ data: { signature: 'foo' } }),
}));
describe('BackendAPI', () => {
    describe('getChallenge', () => {
        it('Returns a challenge if the user has a deliveryService specified ', async () => {
            const account = {
                address: SENDER_ADDRESS,
                profile: {
                    deliveryServices: ['foo.eth'],
                },
            } as Account;
            const connection = {} as Connection;

            const challenge = await getChallenge(account, connection);

            expect(challenge).toBe('my-challenge');
        });
        it('Throws an exception if the account was not specified ', async () => {
            const account = undefined;
            const connection = {} as Connection;

            expect(async () => {
                const challenge = await getChallenge(account!, connection);
            }).rejects.toEqual(Error('No account'));
        });
        it('Throws an exception if the account contains no profile ', async () => {
            const account = {} as Account;
            const connection = {} as Connection;

            expect(async () => {
                const challenge = await getChallenge(account, connection);
            }).rejects.toEqual(Error('Account has no profile.'));
        });
    });
    describe('getNewToken', () => {
        it('Returns a token if a valid signature was provided', async () => {
            const account = {
                address: SENDER_ADDRESS,
                profile: {
                    deliveryServices: ['foo.eth'],
                },
            } as Account;
            const connection = {} as Connection;

            const signature = '';
            const token = await getNewToken(account, connection, signature);
            expect(token).toBe('my-token');
        });
    });
    describe('submitUserProfile', () => {
        it('Returns a userToken if a valid profile was provided', async () => {
            const account = {
                address: SENDER_ADDRESS,
                profile: {
                    deliveryServices: ['foo.eth'],
                },
            } as Account;
            const connection = {} as Connection;

            const signedUserProfile = {} as SignedUserProfile;
            const token = await submitUserProfile(
                account,
                connection,
                signedUserProfile,
            );
            expect(token).toBe('my-profile');
        });
    });
    describe('submitMessage', () => {
        it('returns if no socket was connected', async () => {
            const connection = {} as Connection;
            const token = '';
            const envelop = {} as Envelop;
            const onSuccess = jest.fn();
            const onError = jest.fn();

            await submitMessage(connection, token, envelop, onSuccess, onError);

            expect(onSuccess).not.toBeCalled();
            expect(onError).not.toBeCalled();
        });
        it('Calls onSuccess if the socket accepts the message', async () => {
            const socketMock = {
                emit: (_: any, __: any, callback: any) => {
                    callback('success');
                },
            };

            const connection = {
                socket: socketMock,
            } as unknown as Connection;
            const token = '';
            const envelop = {} as Envelop;
            const onSuccess = jest.fn();
            const onError = jest.fn();

            await submitMessage(connection, token, envelop, onSuccess, onError);

            expect(onSuccess).toBeCalled();
            expect(onError).not.toBeCalled();
        });
        it('Calls onError if the socket rejects the message', async () => {
            const socketMock = {
                emit: (_: any, __: any, callback: any) => {
                    callback('fail');
                },
            };

            const connection = {
                socket: socketMock,
            } as unknown as Connection;
            const token = '';
            const envelop = {} as Envelop;
            const onSuccess = jest.fn();
            const onError = jest.fn();

            await submitMessage(connection, token, envelop, onSuccess, onError);

            expect(onSuccess).not.toBeCalled();
            expect(onError).toBeCalled();
        });
    });
    describe('syncAcknoledgment', () => {
        it('Returns the acknoledgment  ', async () => {
            const connection = {
                account: {
                    profile: {},
                },
            } as Connection;
            const acknoledgments = <Acknoledgment[]>[];
            const token = '';
            const lastMessagePull = 0;
            await syncAcknoledgment(
                connection,
                acknoledgments,
                token,
                lastMessagePull,
            );
        });
    });

    describe('createPendingEntry', () => {
        it('emits event if connection has socket attached', async () => {
            const socketMock = {
                emit: jest.fn((_: any, __: any, callback: any) => {
                    callback('success');
                }),
            };
            const connection = {
                socket: socketMock,
            } as unknown as Connection;
            const token = '';
            const accountAddress = '';
            const contactAddress = '';
            const onSucces = jest.fn();
            const onError = jest.fn();

            await createPendingEntry(
                connection,
                token,
                accountAddress,
                contactAddress,
                onSucces,
                onError,
            );

            expect(socketMock.emit).toBeCalled();
            expect(onSucces).toBeCalled();
            expect(onError).not.toBeCalled();
        });
        it('calls on error in case the callback fails', async () => {
            const socketMock = {
                emit: jest.fn((_: any, __: any, callback: any) => {
                    callback('error');
                }),
            };
            const connection = {
                socket: socketMock,
            } as unknown as Connection;
            const token = '';
            const accountAddress = '';
            const contactAddress = '';
            const onSucces = jest.fn();
            const onError = jest.fn();

            await createPendingEntry(
                connection,
                token,
                accountAddress,
                contactAddress,
                onSucces,
                onError,
            );

            expect(socketMock.emit).toBeCalled();
            expect(onSucces).not.toBeCalled();
            expect(onError).toBeCalled();
        });
    });
    describe('getNewMessages', () => {
        it('Returns new messages', async () => {
            const connection = {
                account: {
                    address: SENDER_ADDRESS,
                    profile: {},
                },
            } as Connection;
            const token = '';
            const accountAddress = '';
            const baseUrl = '';

            const data = await getNewMessages(
                connection,
                token,
                accountAddress,
                baseUrl,
            );

            expect(data).toStrictEqual([]);
        });
    });
    describe('getPendingConversations', () => {
        it('returns pending conversations', async () => {
            const connection = {
                account: {
                    address: SENDER_ADDRESS,
                    profile: {},
                },
            } as Connection;
            const token = '';
            const data = await getPendingConversations(connection, token);
            expect(data).toStrictEqual([]);
        });
    });
    describe('getUserProfileOffChain', () => {
        it('returns profile from given url', async () => {
            const connection = {} as Connection;
            const account = {} as Account;
            const contact = RECEIVER_ADDRESS;
            const url = 'dm3.io';

            const profile = await getUserProfileOffChain(
                connection,
                account,
                contact,
                url,
            );

            expect(profile).toStrictEqual({ signature: 'foo' });
        });
        it('returns fallback profile if url is undefined', async () => {
            const connection = {} as Connection;
            const account = {
                profile: {},
            } as Account;
            const contact = RECEIVER_ADDRESS;
            const url = undefined;

            const profile = await getUserProfileOffChain(
                connection,
                account,
                contact,
                url,
            );

            expect(profile).toStrictEqual({ signature: 'bar' });
        });
    });
});
