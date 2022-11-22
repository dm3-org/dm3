import { checkToken, Session } from './Session';

describe('Session', () => {
    describe('checkToken', () => {
        it('Should return true if a session exists for this account', async () => {
            const getSession = (_: string) =>
                Promise.resolve({ token: 'foo' } as Session);
            const address = '0x25A643B6e52864d0eD816F1E43c0CF49C83B8292';
            const isValid = await checkToken(getSession, address, 'foo');

            expect(isValid).toBe(true);
        });
        it('Should return false if no session exists for the account ', async () => {
            const getSession = (_: string) => Promise.resolve(null);

            const address = '0x25A643B6e52864d0eD816F1E43c0CF49C83B8292';
            const isValid = await checkToken(getSession, address, 'foo');

            expect(isValid).toBe(false);
        });
        it('Should return false if a session exists but the token is wrong ', async () => {
            const getSession = (_: string) =>
                Promise.resolve({ token: 'bar' } as Session);

            const address = '0x25A643B6e52864d0eD816F1E43c0CF49C83B8292';
            const isValid = await checkToken(getSession, address, 'foo');

            expect(isValid).toBe(false);
        });
    });
});
