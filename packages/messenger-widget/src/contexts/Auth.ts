import { AuthState } from '../interfaces/context';
import { AuthStateActions, AuthStateType } from '../utils/enum-type-utils';

export function authReducer(
    state: AuthState,
    { type, payload }: AuthStateActions,
): AuthState {
    switch (type) {
        case AuthStateType.AddNewSession:
            const allSessions = {
                ...state.allSessions,
                [payload.ensName]: payload,
            };
            return {
                ...state,
                currentSession: payload,
                allSessions,
                recentlyUsedSession: payload.ensName,
            };

        default:
            return state;
    }
}
