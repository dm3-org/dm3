import { ConnectionState } from '../web3provider/Web3Provider';

export function showSignIn(connectionState: ConnectionState): boolean {
    return (
        connectionState === ConnectionState.AccountConntectReady ||
        connectionState === ConnectionState.SignInReady ||
        connectionState === ConnectionState.CollectingSignInData ||
        connectionState === ConnectionState.WaitingForAccountConntection ||
        connectionState === ConnectionState.WaitingForSignIn ||
        connectionState === ConnectionState.ConnectionRejected ||
        connectionState === ConnectionState.SignInFailed
    );
}

export function connectionPhase(connectionState: ConnectionState): boolean {
    return (
        connectionState === ConnectionState.WaitingForAccountConntection ||
        connectionState === ConnectionState.ConnectionRejected ||
        connectionState === ConnectionState.AccountConntectReady
    );
}
