import { ethers } from 'ethers';
import { Socket } from 'socket.io-client';
import { DefaultEventsMap } from 'socket.io/dist/typed-events';
import { StorageLocation } from '../storage/Storage';
import { Account } from '../account/Account';

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
    account?: Account;
    provider?: ethers.providers.JsonRpcProvider;
    socket?: Socket<DefaultEventsMap, DefaultEventsMap>;
    storageToken?: string;
    storageLocation: StorageLocation;
    defaultServiceUrl: string;
}

//TODO rename after multichain provider was implemented on the frontend side
export type GetWeb3Provider = (
    ensName: string,
) => ethers.providers.BaseProvider | null;

//TODO rename after multichain provider was implemented on the frontend side
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
