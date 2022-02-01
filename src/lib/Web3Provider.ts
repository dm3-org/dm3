import { ethers } from 'ethers';
import { log } from './log';

export enum ConnecteionState {
    CheckingProvider,
    NoProvider,
    SignInReady,
    AccountConntectReady,
    WaitingForAccountConntection,
    WaitingForSignIn,
    AccountConnectionRejected,
    SignInFailed,
    SignedIn,
}

export async function getWeb3Provider(provider: unknown): Promise<{
    provider?: ethers.providers.Web3Provider;
    connectionState: ConnecteionState;
}> {
    return provider
        ? {
              provider: new ethers.providers.Web3Provider(
                  provider as
                      | ethers.providers.ExternalProvider
                      | ethers.providers.JsonRpcFetchFunc,
              ),
              connectionState: ConnecteionState.AccountConntectReady,
          }
        : {
              connectionState: ConnecteionState.NoProvider,
          };
}

export async function connectAccount(
    provider: ethers.providers.JsonRpcProvider,
    requestAccounts: (
        provider: ethers.providers.JsonRpcProvider,
    ) => Promise<string>,
): Promise<{
    account?: string;
    connectionState: ConnecteionState;
}> {
    try {
        return {
            account: await requestAccounts(provider),
            connectionState: ConnecteionState.SignInReady,
        };
    } catch (e) {
        return {
            connectionState: ConnecteionState.AccountConnectionRejected,
        };
    }
}

export async function signIn(
    provider: ethers.providers.JsonRpcProvider,
    account: string,
    requestChallenge: (account: string) => Promise<string>,
    personalSign: (
        provider: ethers.providers.JsonRpcProvider,
        account: string,
        challenge: string,
    ) => Promise<string>,
    submitSignedChallenge: (
        challenge: string,
        signature: string,
    ) => Promise<void>,
): Promise<{
    connectionState: ConnecteionState;
    sessionToken?: string;
}> {
    try {
        const challenge = await requestChallenge(account);

        log(`Sign in challenge: ${challenge}`);

        const signature = await personalSign(provider, account, challenge);
        submitSignedChallenge(challenge, signature);

        return {
            connectionState: ConnecteionState.SignedIn,
            sessionToken: getSessionToken(signature),
        };
    } catch (e) {
        return {
            connectionState: ConnecteionState.SignInFailed,
        };
    }
}

export function getSessionToken(signature: string) {
    return ethers.utils.keccak256(signature);
}
