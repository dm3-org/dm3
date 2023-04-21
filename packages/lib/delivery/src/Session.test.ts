import { checkToken, Session } from './Session';

describe('Session', () => {
    describe('checkToken', () => {
        it('Should return true if a session exists for this account', async () => {
            const getSession = (_: string) =>
                Promise.resolve({
                    token: 'foo',
                    createdAt: new Date().getTime(),
                } as Session);

            const isValid = await checkToken(
                {
                    resolveName: async () =>
                        '0x25A643B6e52864d0eD816F1E43c0CF49C83B8292',
                } as any,
                getSession,
                'alice.eth',
                'foo',
            );

            expect(isValid).toBe(true);
        });

        it('Should return false if no session exists for the account ', async () => {
            const getSession = (_: string) => Promise.resolve(null);

            const isValid = await checkToken(
                {
                    resolveName: async () =>
                        '0x25A643B6e52864d0eD816F1E43c0CF49C83B8292',
                } as any,
                getSession,
                'alice.eth',
                'foo',
            );

            expect(isValid).toBe(false);
        });

        it('Should return false if a session exists but the token is wrong ', async () => {
            const getSession = (_: string) =>
                Promise.resolve({ token: 'bar' } as Session);

            const isValid = await checkToken(
                {
                    resolveName: async () =>
                        '0x25A643B6e52864d0eD816F1E43c0CF49C83B8292',
                } as any,
                getSession,
                'alice.eth',
                'foo',
            );

            expect(isValid).toBe(false);
        });

        it('Should return false if a session exists but the token is expired ', async () => {
            const getSession = (_: string) =>
                Promise.resolve({ token: 'foo', createdAt: 1 } as Session);

            const isValid = await checkToken(
                {
                    resolveName: async () =>
                        '0x25A643B6e52864d0eD816F1E43c0CF49C83B8292',
                } as any,
                getSession,
                'alice.eth',
                'foo',
            );

            expect(isValid).toBe(false);
        });
    });
});
