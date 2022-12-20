import { ethers } from 'ethers';
import { checkSignature, sign } from '../crypto';
import { createChallenge, createNewSessionToken } from './Keys';
import { Session } from './Session';

const RANDO_ADDRESS = '0xDd36ae7F9a8E34FACf1e110c6e9d37D0dc917855';
const SENDER_ADDRESS = '0x71CB05EE1b1F506fF321Da3dac38f25c0c9ce6E1';

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
            const getSession = () => Promise.resolve(null);
            const setSession = () => Promise.resolve();

            await expect(async () => {
                await createChallenge(getSession, setSession, RANDO_ADDRESS);
            }).rejects.toEqual(Error('Session not found'));
        });

        it('Returns already existing challenge', async () => {
            const getSession = () =>
                Promise.resolve({ challenge: 'foo' } as Session);
            const setSession = () => Promise.resolve();

            const challenge = await createChallenge(
                getSession,
                setSession,
                RANDO_ADDRESS,
            );

            expect(challenge).toBe('foo');
        });
        it('Creates a new challenge if the session does not contain a session yet', async () => {
            const getSession = () => Promise.resolve({} as Session);
            const setSession = jest.fn();

            const challenge = await createChallenge(
                getSession,
                setSession,
                RANDO_ADDRESS,
            );

            expect(challenge).not.toBeUndefined();
            expect(setSession).toBeCalled();
        });
    });
    describe('CreateNewSessionToken', () => {
        it('Throws Exception if Session was not found', async () => {
            const getSession = () => Promise.resolve(null);
            const setSession = () => Promise.resolve();

            await expect(async () => {
                await createNewSessionToken(
                    getSession,
                    setSession,
                    '',
                    RANDO_ADDRESS,
                );
            }).rejects.toEqual(Error('Session not found'));
        });
        it('Throws Exception if No challenge exists', async () => {
            const getSession = () => Promise.resolve({} as Session);
            const setSession = () => Promise.resolve();

            await expect(async () => {
                await createNewSessionToken(
                    getSession,
                    setSession,
                    '',
                    RANDO_ADDRESS,
                );
            }).rejects.toEqual(Error('No pending challenge'));
        });

        it('Returns token if challenge was correct', async () => {
            const challenge = 'my-Challenge';
            expect.assertions(2);

            const getSession = () =>
                Promise.resolve({
                    challenge,
                    signedUserProfile: {
                        profile: {
                            publicSigningKey: keysA.signingKeyPair.publicKey,
                        },
                    },
                } as Session);
            const setSession = jest.fn();

            const signature =
                '3A893rTBPEa3g9FL2vgDreY3vvXnOiYCOoJURNyctncwH' +
                '0En/mcwo/t2v2jtQx/pcnOpTzuJwLuZviTQjd9vBQ==';

            const token = await createNewSessionToken(
                getSession,
                setSession,
                signature,
                SENDER_ADDRESS,
            );

            expect(token).not.toBeUndefined();
            expect(setSession).toBeCalled();
        });

        it('Throws Exception if challange was solved wrong', async () => {
            const challenge = 'my-Challenge';

            const getSession = () =>
                Promise.resolve({
                    challenge,
                    signedUserProfile: {
                        profile: {
                            publicSigningKey: keysA.signingKeyPair.publicKey,
                        },
                    },
                } as Session);
            const setSession = () => Promise.resolve();

            const signature =
                'YgT2r48h7JxDmOEzvM9UBjYnGV+K0ouLDsei44tdH2+ps' +
                'rR4nbPY1fQJialx6fKly62tgkE5vs5EGbU+Bf+IBA==';

            await expect(async () => {
                await createNewSessionToken(
                    getSession,
                    setSession,
                    signature,
                    SENDER_ADDRESS,
                );
            }).rejects.toEqual(Error('Signature invalid'));
        });
    });
});
