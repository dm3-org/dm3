import { sign } from 'crypto';
import { ethers } from 'ethers';
import { getProfileCreationMessage, UserProfile } from '../account';
import { formatAddress } from '../external-apis';
import { stringify } from '../shared/stringify';
import { Session } from './Session';
import { submitUserProfile } from './UserProfile';

const SENDER_ADDRESS = '0x71CB05EE1b1F506fF321Da3dac38f25c0c9ce6E1';
const RANDO_ADDRESS = '0xDd36ae7F9a8E34FACf1e110c6e9d37D0dc917855';

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

const keysB = {
    encryptionKeyPair: {
        publicKey:
            '0x19867565066fc86c876f6f027006f64edabe435155fffa5269746eac00142608',
        privateKey:
            '0x395643aa80723066c4ce1c5d1dc4eeaf3a44c31c4fdbfd44322354c7e493e60e',
    },
    signingKeyPair: {
        publicKey:
            '0xee64c50eb6b097cee37b534d9d1858128578b465578479533dc69d968aa2be6d',
        privateKey:
            '0xf83a5e0630b32021688bbe37ff8ebac89ba7b07479e4186bdc69ea712e1cb89' +
            '6ee64c50eb6b097cee37b534d9d1858128578b465578479533dc69d968aa2be6d',
    },
    storageEncryptionKey:
        '0xf83a5e0630b32021688bbe37ff8ebac89ba7b07479e4186bdc69ea712e1cb896',
    storageEncryptionNonce: 0,
};

const emptyProfile: UserProfile = {
    publicSigningKey: '',
    publicEncryptionKey: '',
    deliveryServices: [''],
};

const signProfile = async (profile: UserProfile) => {
    //0x71CB05EE1b1F506fF321Da3dac38f25c0c9ce6E1
    const mnemonic =
        'announce room limb pattern dry unit scale effort smooth jazz weasel alcohol';

    const wallet = ethers.Wallet.fromMnemonic(mnemonic);

    const profileCreationMessage = getProfileCreationMessage(
        stringify(profile),
    );

    const signature = await wallet.signMessage(profileCreationMessage);

    const signedUserProfile = {
        profile,
        signature,
    };
    return await signedUserProfile;
};

describe('UserProfile', () => {
    describe('SubmitUserProfile', () => {
        it('rejects a userProfile with a wrong signature', async () => {
            const setSession = jest.fn();
            const getSession = () => Promise.resolve(null);
            const getPendingConversations = () => Promise.resolve([]);
            const send = () => {};

            const singedUserProfile = await signProfile(emptyProfile);

            await expect(async () => {
                await submitUserProfile(
                    getSession,
                    setSession,
                    RANDO_ADDRESS,
                    singedUserProfile,
                    getPendingConversations,
                    send,
                );
            }).rejects.toEqual(Error('Signature invalid.'));
            expect(setSession).not.toBeCalled();
        });

        it('rejects a userProfile that already exists', async () => {
            const setSession = () => Promise.resolve();
            const getSession = async (address: string) => {
                const session = async (
                    account: string,
                    token: string,
                    profile: UserProfile,
                ): Promise<Session> => {
                    const signedUserProfile = await signProfile(profile);
                    return {
                        account,
                        signedUserProfile,
                        token,
                        createdAt: new Date().getTime(),
                        profileExtension: {
                            encryptionAlgorithm: [],
                            notSupportedMessageTypes: [],
                        },
                    };
                };

                return session(SENDER_ADDRESS, '123', emptyProfile);
            };
            const getPendingConversations = () => Promise.resolve([]);
            const send = () => {};

            const singedUserProfile = await signProfile(emptyProfile);

            await expect(async () => {
                await submitUserProfile(
                    getSession,
                    setSession,
                    SENDER_ADDRESS,
                    singedUserProfile,
                    getPendingConversations,
                    send,
                );
            }).rejects.toEqual(Error('Profile exists already'));
        });
        it('skips pending contact without a session', async () => {
            const setSession = jest.fn();
            const getSession = (address: string) => Promise.resolve(null);
            const getPendingConversations = () =>
                Promise.resolve([RANDO_ADDRESS]);
            const send = jest.fn();

            const singedUserProfile = await signProfile(emptyProfile);

            await submitUserProfile(
                getSession,
                setSession,
                SENDER_ADDRESS,
                singedUserProfile,
                getPendingConversations,
                send,
            );

            expect(setSession).toBeCalled();
            expect(send).not.toBeCalled();
        });
        it('notifies pending contact with a socketId', async () => {
            const setSession = jest.fn();
            const getSession = (address: string) => {
                if (address === RANDO_ADDRESS) {
                    return Promise.resolve({
                        socketId: 'foo',
                    } as Session);
                }
                return Promise.resolve(null);
            };
            const getPendingConversations = () =>
                Promise.resolve([RANDO_ADDRESS]);
            const send = jest.fn();

            const singedUserProfile = await signProfile(emptyProfile);

            await submitUserProfile(
                getSession,
                setSession,
                SENDER_ADDRESS,
                singedUserProfile,
                getPendingConversations,
                send,
            );

            expect(setSession).toBeCalled();
            expect(send).toBeCalled();
        });
        it('stores a newly created user profile', async () => {
            const setSession = jest.fn();
            const getSession = () => Promise.resolve(null);
            const getPendingConversations = () => Promise.resolve([]);
            const send = () => {};

            const singedUserProfile = await signProfile(emptyProfile);

            await submitUserProfile(
                getSession,
                setSession,
                SENDER_ADDRESS,
                singedUserProfile,
                getPendingConversations,
                send,
            );

            expect(setSession).toBeCalled();
        });
    });
});
