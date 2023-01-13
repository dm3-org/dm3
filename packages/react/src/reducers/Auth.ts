import { ActionMap } from './shared';

export interface AuthState {
    allSessions: { [address: string]: AuthSession };
    currentSession?: AuthSession;
    recentlyUsedSession?: string;
}
export interface AuthSession {
    storage: string;
    token: string;
    ensName: string;
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
