import { createChallenge } from './Keys';
import { Session } from './Session';

const RANDO_ADDRESS = '0xDd36ae7F9a8E34FACf1e110c6e9d37D0dc917855';

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
});
