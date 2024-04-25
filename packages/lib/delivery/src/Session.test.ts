import { checkToken, Session } from './Session';
import { sign } from 'jsonwebtoken';

const serverSecret = 'veryImportantSecretToGenerateAndValidateJSONWebTokens';
// create valid jwt
const token = sign({ user: 'alice.eth' }, serverSecret, {
    expiresIn: '1h',
});

describe('Session', () => {
    describe('checkToken', () => {
        it('Should return true if the jwt is valid', async () => {
            const getSession = (_: string) =>
                Promise.resolve({
                    token: token,
                    createdAt: new Date().getTime(),
                } as Session);

            const isValid = await checkToken(
                {
                    resolveName: async () =>
                        '0x25A643B6e52864d0eD816F1E43c0CF49C83B8292',
                } as any,
                getSession,
                'alice.eth',
                token,
                serverSecret,
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
                token,
                serverSecret,
            );

            expect(isValid).toBe(false);
        });

        it('Should return false if the token is signed with a different secret ', async () => {
            const token = sign({ user: 'alice.eth' }, 'attackersSecret', {
                expiresIn: '1h',
            });
            const getSession = (_: string) =>
                Promise.resolve({ token: 'bar' } as Session);

            const isValid = await checkToken(
                {
                    resolveName: async () =>
                        '0x25A643B6e52864d0eD816F1E43c0CF49C83B8292',
                } as any,
                getSession,
                'alice.eth',
                token,
                serverSecret,
            );

            expect(isValid).toBe(false);
        });

        it('Should return false if a session exists but the token is expired ', async () => {
            const getSession = (_: string) =>
                Promise.resolve({ token: token, createdAt: 1 } as Session);

            const oneMinuteAgo = new Date().getTime() / 1000 - 60;
            // this token expired a minute ago
            const _token = sign(
                { user: 'alice.eth', iat: oneMinuteAgo, exp: oneMinuteAgo },
                serverSecret,
            );

            const isValid = await checkToken(
                {
                    resolveName: async () =>
                        '0x25A643B6e52864d0eD816F1E43c0CF49C83B8292',
                } as any,
                getSession,
                'alice.eth',
                _token,
                serverSecret,
            );

            expect(isValid).toBe(false);
        });

        it('Should return false token issuance date is in the future ', async () => {
            const getSession = (_: string) =>
                Promise.resolve({ token: token, createdAt: 1 } as Session);

            const oneMinuteInTheFuture = new Date().getTime() / 1000 + 60;
            // this token is not valid yet
            const _token = sign(
                {
                    user: 'alice.eth',
                    iat: oneMinuteInTheFuture,
                    exp: oneMinuteInTheFuture,
                },
                serverSecret,
            );

            const isValid = await checkToken(
                {
                    resolveName: async () =>
                        '0x25A643B6e52864d0eD816F1E43c0CF49C83B8292',
                } as any,
                getSession,
                'alice.eth',
                _token,
                serverSecret,
            );

            expect(isValid).toBe(false);
        });
    });
});
