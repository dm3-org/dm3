import * as Lib from 'dm3-lib';

export function showSignIn(
    connectionState: Lib.web3provider.ConnectionState,
): boolean {
    return (
        connectionState ===
            Lib.web3provider.ConnectionState.AccountConntectReady ||
        connectionState === Lib.web3provider.ConnectionState.SignInReady ||
        connectionState ===
            Lib.web3provider.ConnectionState.CollectingSignInData ||
        connectionState ===
            Lib.web3provider.ConnectionState.WaitingForAccountConntection ||
        connectionState === Lib.web3provider.ConnectionState.WaitingForSignIn ||
        connectionState ===
            Lib.web3provider.ConnectionState.ConnectionRejected ||
        connectionState === Lib.web3provider.ConnectionState.SignInFailed
    );
}

export function connectionPhase(
    connectionState: Lib.web3provider.ConnectionState,
): boolean {
    return (
        connectionState ===
            Lib.web3provider.ConnectionState.WaitingForAccountConntection ||
        connectionState ===
            Lib.web3provider.ConnectionState.ConnectionRejected ||
        connectionState ===
            Lib.web3provider.ConnectionState.AccountConntectReady
    );
}
