import { Account } from '../account';
import { SignedUserProfile } from '../account/Account';
import { Envelop } from '../messaging';
import { Connection } from '../web3-provider/Web3Provider';
import {
    getChallenge,
    getNewToken,
    submitMessage,
    submitUserProfile,
} from './BackendAPI';

const SENDER_ADDRESS = '0x25A643B6e52864d0eD816F1E43c0CF49C83B8292';
const RECEIVER_ADDRESS = '0xDd36ae7F9a8E34FACf1e110c6e9d37D0dc917855';

jest.mock('../delivery/Delivery', () => ({
    getDeliveryServiceClient: jest.fn(() => ({
        get: () => ({
            data: { challenge: 'my-challenge' },
        }),
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
            }
        },
    })),
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
});
