import { ethers } from 'ethers';
import { Socket } from 'socket.io-client';
import { DefaultEventsMap } from 'socket.io/dist/typed-events';
import { StorageLocation, UserDB } from '../storage/Storage';
import { Account } from '../account/Account';
import { log } from '../shared/log';

export enum ConnectionState {
    CheckingProvider,
    NoProvider,
    SignInReady,
    AccountConntectReady,
    WaitingForAccountConntection,
    WaitingForSignIn,
    AccountConnectionRejected,
    SignInFailed,
    SignedIn,
    KeyCreation,
}

export interface Connection {
    connectionState: ConnectionState;
    account?: Account;
    provider?: ethers.providers.JsonRpcProvider;
    socket?: Socket<DefaultEventsMap, DefaultEventsMap>;
    storageToken?: string;
    storageLocation: StorageLocation;
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
              connectionState: ConnectionState.NoProvider,
          };
}
