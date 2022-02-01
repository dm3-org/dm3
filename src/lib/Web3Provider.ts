import { ethers } from 'ethers';

export enum ConnecteionState {
    CheckingProvider,
    NoProvider,
    SignInReady,
    WaitingForAccountConntection,
    AccountConnectionRejected,
    AccountConnected,
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
              connectionState: ConnecteionState.SignInReady,
          }
        : {
              connectionState: ConnecteionState.NoProvider,
          };
}
