import { sign } from '@dm3-org/dm3-lib-crypto';
import { stringify } from '@dm3-org/dm3-lib-shared';
import { mockUserProfile } from '@dm3-org/dm3-lib-test-helper';
import { ethers } from 'ethers';
import { JsonWebTokenError } from 'jsonwebtoken';
import { IAccountDatabase } from './iAccountDatabase';
import { createChallenge, createNewSessionToken } from './Keys';

const RANDO_ADDRESS = '0xDd36ae7F9a8E34FACf1e110c6e9d37D0dc917855';
const SENDER_ADDRESS = '0x71CB05EE1b1F506fF321Da3dac38f25c0c9ce6E1';
const SERVER_SECRET = 'my-secret-for-jwt';

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

const mockDbWithAccount: IAccountDatabase = {
    hasAccount: async (ensName: string) => Promise.resolve(true),
};

const mockDbWithOUTAccount: IAccountDatabase = {
    hasAccount: async (ensName: string) => Promise.resolve(false),
};

describe('Keys', () => {
    let user: any;
    let expectedUserProfile: any;
    let userAddress: string;
    let mockWeb3Provider: ethers.providers.StaticJsonRpcProvider;

    beforeAll(async () => {
        user = await mockUserProfile(
            ethers.Wallet.createRandom(),
            'alice.eth',
            ['ds1.eth', 'ds2.eth'],
        );
        expectedUserProfile = user.signedUserProfile;
        userAddress = user.wallet.address;

        const mockGetEnsResolver = (_: string) =>
            Promise.resolve({
                getText: (_: string) =>
                    Promise.resolve(
                        'data:application/json,' +
                            stringify(expectedUserProfile),
                    ),
            });

        mockWeb3Provider = {
            getResolver: mockGetEnsResolver,
            resolveName: async () => userAddress,
        } as unknown as ethers.providers.StaticJsonRpcProvider;
    });

    describe('CreateChallenge', () => {
        it('Throws Exception if Account was not found', async () => {
            await expect(async () => {
                await createChallenge(
                    mockDbWithOUTAccount,
                    RANDO_ADDRESS,
                    SERVER_SECRET,
                );
            }).rejects.toEqual(Error("User account doesn't exist"));
        });

        it('Ignores challenge field in database', async () => {
            const challenge = await createChallenge(
                mockDbWithAccount,
                RANDO_ADDRESS,
                SERVER_SECRET,
            );

            expect(challenge).not.toBe('foo');
        });

        it('Creates a new challenge even if called multiple times', async () => {
            const challenge1 = await createChallenge(
                mockDbWithAccount,
                RANDO_ADDRESS,
                SERVER_SECRET,
            );

            const challenge2 = await createChallenge(
                mockDbWithAccount,
                RANDO_ADDRESS,
                SERVER_SECRET,
            );

            expect(challenge1).not.toBeUndefined();
            expect(challenge2).not.toBeUndefined();
            expect(challenge1).not.toBe(challenge2);
        });
    });

    describe('CreateNewSessionToken', () => {
        it('Throws Exception if Account was not found', async () => {
            const getAccount = () => Promise.resolve(null);

            await expect(async () => {
                await createNewSessionToken(
                    mockDbWithOUTAccount,
                    'signature',
                    'challenge',
                    RANDO_ADDRESS,
                    SERVER_SECRET,
                    mockWeb3Provider,
                );
            }).rejects.toEqual(Error("User account doesn't exist"));
        });

        it('Throws Exception if the challenge is not valid', async () => {
            await expect(async () => {
                await createNewSessionToken(
                    mockDbWithAccount,
                    'signature',
                    'challenge',
                    RANDO_ADDRESS,
                    SERVER_SECRET,
                    mockWeb3Provider,
                );
            }).rejects.toEqual(new JsonWebTokenError('jwt malformed'));
        });

        it('Returns token if challenge was correct', async () => {
            // create valid challenge jwt
            const challenge = await createChallenge(
                mockDbWithAccount,
                SENDER_ADDRESS,
                SERVER_SECRET,
            );

            const signature = await sign(
                user.profileKeys.signingKeyPair.privateKey,
                challenge,
            );

            const token = await createNewSessionToken(
                mockDbWithAccount,
                signature,
                challenge,
                SENDER_ADDRESS,
                SERVER_SECRET,
                mockWeb3Provider,
            );

            expect(token).not.toBeUndefined();
        });

        it('Throws Exception if challange was solved wrong', async () => {
            // create valid challenge jwt
            const challenge = await createChallenge(
                mockDbWithAccount,
                SENDER_ADDRESS,
                SERVER_SECRET,
            );

            const signature = 'invalid signature';

            await expect(async () => {
                await createNewSessionToken(
                    mockDbWithAccount,
                    signature,
                    challenge,
                    SENDER_ADDRESS,
                    SERVER_SECRET,
                    mockWeb3Provider,
                );
            }).rejects.toEqual(TypeError('invalid signature length'));
        });
    });
});
