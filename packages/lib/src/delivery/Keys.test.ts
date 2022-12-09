import { ethers } from 'ethers';
import { UserProfile } from '../account';
import { createChallenge, createNewSessionToken } from './Keys';
import { Session } from './Session';

const RANDO_ADDRESS = '0xDd36ae7F9a8E34FACf1e110c6e9d37D0dc917855';
const SENDER_ADDRESS = '0x71CB05EE1b1F506fF321Da3dac38f25c0c9ce6E1';
const signChallenge = async (challenge: string) => {
    //0x71CB05EE1b1F506fF321Da3dac38f25c0c9ce6E1
    const mnemonic =
        'announce room limb pattern dry unit scale effort smooth jazz weasel alcohol';

    const wallet = ethers.Wallet.fromMnemonic(mnemonic);

    return await wallet.signMessage(challenge);
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

            const getSession = () => Promise.resolve({ challenge } as Session);
            const setSession = jest.fn();

            const signature = await signChallenge(challenge);

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

            const getSession = () => Promise.resolve({ challenge } as Session);
            const setSession = () => Promise.resolve();

            const signature = await signChallenge('grgrgrgr');

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
