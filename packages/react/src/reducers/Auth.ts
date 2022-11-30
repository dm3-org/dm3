import { ActionMap } from './shared';

export interface AuthState {
    allSessions: { [address: string]: AuthSession };
    currentSession?: AuthSession;
    recentlyUsedSession?: string;
}
export interface AuthSession {
    storage: string;
    token: string;
    address: string;
    storageEncryptionKey?: string;
}

export enum AuthStateType {
    AddNewSession = 'ADD_NEW_SESSION',
}

export type AuthStatePayload = {
    [AuthStateType.AddNewSession]: AuthSession;
};

export type AuthStateActions =
    ActionMap<AuthStatePayload>[keyof ActionMap<AuthStatePayload>];

export function authReducer(
    state: AuthState,
    { type, payload }: AuthStateActions,
): AuthState {
    switch (type) {
        case AuthStateType.AddNewSession:
            const allSessions = {
                ...state.allSessions,
                [payload.address]: payload,
            };
            return {
                ...state,
                currentSession: payload,
                allSessions,
                recentlyUsedSession: payload.address,
            };

        default:
            return state;
    }
}
