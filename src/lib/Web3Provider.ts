import { ethers } from 'ethers';

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
}

export interface ApiConnection {
    connectionState: ConnectionState;
    account?: string;
    sessionToken?: string;
    provider?: ethers.providers.JsonRpcProvider;
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
    connectionState: ConnectionState;
    sessionToken?: string;
}> {
    try {
        const challenge = await requestChallenge(account);

        log(`Sign in challenge: ${challenge}`);

        const signature = await personalSign(provider, account, challenge);
        submitSignedChallenge(challenge, signature);

        return {
            connectionState: ConnectionState.SignedIn,
            sessionToken: getSessionToken(signature),
        };
    } catch (e) {
        return {
            connectionState: ConnectionState.SignInFailed,
        };
    }
}

export function getSessionToken(signature: string) {
    return ethers.utils.keccak256(signature);
}

export function getAccountDisplayName(
    accountAddress: string | undefined,
    ensNames: Map<string, string>,
): string {
    if (!accountAddress) {
        return '';
    }
    if (ensNames.get(accountAddress)) {
        return ensNames.get(accountAddress) as string;
    }
    return accountAddress.length > 10
        ? accountAddress.substring(0, 4) +
              '...' +
              accountAddress.substring(accountAddress.length - 4)
        : accountAddress;
}

export async function addContact(
    apiConnection: ApiConnection,
    input: string,
    resolveName: (
        provider: ethers.providers.JsonRpcProvider,
        input: string,
    ) => Promise<string | null>,
    addContactAPI: (
        apiConnection: ApiConnection,
        contactAddress: string,
    ) => Promise<void>,
) {
    if (ethers.utils.isAddress(input)) {
        await addContactAPI(apiConnection, input);
    } else {
        const address = await resolveName(
            apiConnection.provider as ethers.providers.JsonRpcProvider,
            input,
        );
        if (address) {
            addContactAPI(apiConnection, address);
        } else {
            throw Error(`Couldn't resolve name`);
        }
    }
}
