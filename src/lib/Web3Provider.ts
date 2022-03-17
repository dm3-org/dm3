import { ethers } from 'ethers';
import { Socket } from 'socket.io-client';
import { DefaultEventsMap } from 'socket.io/dist/typed-events';
import { UserDB } from './Storage';
import { Account } from './Account';
import { log } from './log';

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
    account: Account;
    sessionToken: string;
    provider: ethers.providers.JsonRpcProvider;
    socket: Socket<DefaultEventsMap, DefaultEventsMap>;
    db: UserDB;
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

export async function connectAccount(
    provider: ethers.providers.JsonRpcProvider,
    requestAccounts: (
        provider: ethers.providers.JsonRpcProvider,
    ) => Promise<string>,
): Promise<{
    account?: string;
    connectionState: ConnectionState;
}> {
    try {
        return {
            account: await requestAccounts(provider),
            connectionState: ConnectionState.SignInReady,
        };
    } catch (e) {
        return {
            connectionState: ConnectionState.AccountConnectionRejected,
        };
    }
}

export function logConnectionChange(newConnection: Partial<Connection>) {
    if (newConnection.connectionState) {
        log(
            `Changing state to ${
                ConnectionState[newConnection.connectionState]
            }`,
        );
    }

    if (newConnection.sessionToken) {
        log(`Retrieved new session token: ${newConnection.sessionToken}`);
    }

    if (newConnection.account) {
        log(`Account: ${newConnection.account.address}`);
    }

    if (newConnection.provider) {
        log(`Provider set`);
    }

    if (newConnection.provider) {
        log(`Socket set`);
    }

    if (newConnection.db) {
        log(`DB set`);
    }
}
