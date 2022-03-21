import * as Lib from '../lib';

export function showSignIn(connectionState: Lib.ConnectionState): boolean {
    return (
        connectionState === Lib.ConnectionState.AccountConntectReady ||
        connectionState === Lib.ConnectionState.SignInReady ||
        connectionState === Lib.ConnectionState.WaitingForAccountConntection ||
        connectionState === Lib.ConnectionState.WaitingForSignIn ||
        connectionState === Lib.ConnectionState.AccountConnectionRejected ||
        connectionState === Lib.ConnectionState.SignInFailed
    );
}

export function connectionPhase(connectionState: Lib.ConnectionState): boolean {
    return (
        connectionState === Lib.ConnectionState.WaitingForAccountConntection ||
        connectionState === Lib.ConnectionState.AccountConnectionRejected ||
        connectionState === Lib.ConnectionState.AccountConntectReady
    );
}
