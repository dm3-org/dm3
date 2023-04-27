import { ethers } from 'ethers';
import { Socket } from 'socket.io-client';
import { DefaultEventsMap } from 'socket.io/dist/typed-events';
import { StorageLocation } from 'dm3-lib-storage';
import { Account } from 'dm3-lib-profile';

export enum ConnectionState {
    CollectingSignInData,
    SignInReady,
    AccountConntectReady,
    WaitingForAccountConntection,
    WaitingForSignIn,
    ConnectionRejected,
    SignInFailed,
    SignedIn,
}

export interface Connection {
    connectionState: ConnectionState;
    ethAddress?: string;
    account?: Account;
    provider?: ethers.providers.JsonRpcProvider;
    socket?: Socket<DefaultEventsMap, DefaultEventsMap>;
    storageToken?: string;
    storageLocation: StorageLocation;
    defaultServiceUrl: string;
}

export async function getWeb3Provider(provider: unknown): Promise<{
    provider?: ethers.providers.Web3Provider;
    connectionState: ConnectionState;
}> {
    return provider
        ? {
              provider: new ethers.providers.Web3Provider(
                  provider as
                      | ethers.providers.ExternalProvider
                      | ethers.providers.JsonRpcFetchFunc,
              ),
              connectionState: ConnectionState.AccountConntectReady,
          }
        : {
              connectionState: ConnectionState.ConnectionRejected,
          };
}
