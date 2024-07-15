import { sign } from '@dm3-org/dm3-lib-crypto';
import { createChallenge, createNewSessionToken } from './Keys';
import * as spamFilter from './spam-filter/SpamFilterRules';
import { Session } from './Session';
import { JsonWebTokenError } from 'jsonwebtoken';

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

describe('Keys', () => {
    describe('CreateChallenge', () => {
        it('Throws Exception if Session was not found', async () => {
            const getAccount = () => Promise.resolve(null);
            const setAccount = () => Promise.resolve();

            await expect(async () => {
                await createChallenge(getAccount, RANDO_ADDRESS, SERVER_SECRET);
            }).rejects.toEqual(Error('Session not found'));
        });

        it('Ignores challenge field in database', async () => {
            const getAccount = () =>
                Promise.resolve({ challenge: 'foo' } as Session);

            const challenge = await createChallenge(
                getAccount,
                RANDO_ADDRESS,
                SERVER_SECRET,
            );

            expect(challenge).not.toBe('foo');
        });
        it('Creates a new challenge even if called multiple times', async () => {
            const getAccount = () => Promise.resolve({} as Session);

            const challenge1 = await createChallenge(
                getAccount,
                RANDO_ADDRESS,
                SERVER_SECRET,
            );

            const challenge2 = await createChallenge(
                getAccount,
                RANDO_ADDRESS,
                SERVER_SECRET,
            );

            expect(challenge1).not.toBeUndefined();
            expect(challenge2).not.toBeUndefined();
            expect(challenge1).not.toBe(challenge2);
        });
    });
    describe('CreateNewSessionToken', () => {
        it('Throws Exception if Session was not found', async () => {
            const getAccount = () => Promise.resolve(null);

            await expect(async () => {
                await createNewSessionToken(
                    getAccount,
                    'signature',
                    'challenge',
                    RANDO_ADDRESS,
                    SERVER_SECRET,
                );
            }).rejects.toEqual(Error('Session not found'));
        });
        it('Throws Exception if the challenge is not valid', async () => {
            const getAccount = () => Promise.resolve({} as Session);

            await expect(async () => {
                await createNewSessionToken(
                    getAccount,
                    'signature',
                    'challenge',
                    RANDO_ADDRESS,
                    SERVER_SECRET,
                );
            }).rejects.toEqual(new JsonWebTokenError('jwt malformed'));
        });

        it('Returns token if challenge was correct', async () => {
            const sessionMocked = {
                challenge: '123',
                token: 'deprecated token that is not used anymore',
                signedUserProfile: {
                    profile: {
                        publicSigningKey: keysA.signingKeyPair.publicKey,
                    },
                },
            } as Session & {
                spamFilterRules: spamFilter.SpamFilterRules;
            };

            const getAccount = async (ensName: string) =>
                Promise.resolve<
                    Session & {
                        spamFilterRules: spamFilter.SpamFilterRules;
                    }
                >(sessionMocked);

            // create valid challenge jwt
            const challenge = await createChallenge(
                getAccount,
                SENDER_ADDRESS,
                SERVER_SECRET,
            );

            const signature = await sign(
                keysA.signingKeyPair.privateKey,
                challenge,
            );

            const token = await createNewSessionToken(
                getAccount,
                signature,
                challenge,
                SENDER_ADDRESS,
                SERVER_SECRET,
            );

            expect(token).not.toBeUndefined();
        });

        it('Throws Exception if challange was solved wrong', async () => {
            const sessionMocked = {
                challenge: '123',
                token: 'deprecated token that is not used anymore',
                signedUserProfile: {
                    profile: {
                        publicSigningKey: keysA.signingKeyPair.publicKey,
                    },
                },
            } as Session & {
                spamFilterRules: spamFilter.SpamFilterRules;
            };

            const getAccount = async (ensName: string) =>
                Promise.resolve<
                    Session & {
                        spamFilterRules: spamFilter.SpamFilterRules;
                    }
                >(sessionMocked);

            // create valid challenge jwt
            const challenge = await createChallenge(
                getAccount,
                SENDER_ADDRESS,
                SERVER_SECRET,
            );

            const signature = 'invalid signature';

            await expect(async () => {
                await createNewSessionToken(
                    getAccount,
                    signature,
                    challenge,
                    SENDER_ADDRESS,
                    SERVER_SECRET,
                );
            }).rejects.toEqual(TypeError('invalid signature length'));
        });
    });
});
