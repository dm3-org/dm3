import { authReducer, AuthSession, AuthStateType } from './Auth';

describe('Accounts', () => {
    describe('Add New Session', () => {
        it('Add new Session ', () => {
            const authState = {
                allSessions: {},
                currentSession: undefined,
                recentlyUsedSession: undefined,
            };

            const newSession = {
                storage: 'browser',
                token: 'foo',
                address: '0x25A643B6e52864d0eD816F1E43c0CF49C83B8292',
            };

            const actions = {
                type: AuthStateType.AddNewSession,
                payload: newSession,
            };

            const newState = authReducer(authState, actions);

            expect(
                newState.allSessions[
                    '0x25A643B6e52864d0eD816F1E43c0CF49C83B8292'
                ],
            ).toBe(newSession);
            expect(newState.currentSession).toBe(newSession);
            expect(newState.recentlyUsedSession).toBe(newSession.address);
        });
    });
});
