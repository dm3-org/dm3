import { ethers } from 'ethers';

export interface Executable {
    method: (...args: any[]) => Promise<ethers.providers.TransactionResponse>;
    args: any[];
}

export async function prersonalSign(
    provider: ethers.providers.JsonRpcProvider,
    address: string,
    message: string,
): Promise<any> {
    return provider.send('personal_sign', [message, address]);
}
export type PersonalSign = typeof prersonalSign;

export async function requestAccounts(
    provider: ethers.providers.JsonRpcProvider,
): Promise<string> {
    return (await provider.send('eth_requestAccounts', []))[0];
}
export type RequestAccounts = typeof requestAccounts;

export async function lookupAddress(
    provider: ethers.providers.JsonRpcProvider,
    accountAddress: string,
): Promise<string | null> {
    return provider.lookupAddress(accountAddress);
}
export type LookupAddress = typeof lookupAddress;

export async function resolveName(
    provider: ethers.providers.JsonRpcProvider,
    name: string,
): Promise<string | null> {
    return provider.resolveName(name);
}
export type ResolveName = typeof resolveName;

export async function resolveOwner(
    provider: ethers.providers.JsonRpcProvider,
    ensName: string,
) {
    if (!provider.network.ensAddress) {
        throw Error('No ENS address found');
    }
    const registryContract = getConractInstance(
        provider.network.ensAddress,
        ['function owner(bytes32 node) external view returns (address)'],
        provider,
    );

    const node = ethers.utils.namehash(ensName);
    return await registryContract.owner(node);
}
export type ResolveOwner = typeof resolveOwner;

export function formatAddress(address: string) {
    return ethers.utils.getAddress(address);
}

export function checkSignature(
    message: string,
    account: string,
    signature: string,
): boolean {
    return (
        formatAddress(
            ethers.utils.recoverAddress(
                ethers.utils.hashMessage(message),
                signature,
            ),
        ) === formatAddress(account)
    );
}

export async function getEnsTextRecord(
    provider: ethers.providers.JsonRpcProvider,
    ensName: string,
    recordKey: string,
) {
    try {
        const resolver = await provider.getResolver(ensName);
        if (resolver === null) {
            return;
        }

        return await resolver.getText(recordKey);
    } catch (e) {
        return undefined;
    }
}
export type GetEnsTextRecord = typeof getEnsTextRecord;

export async function getResolver(
    provider: ethers.providers.JsonRpcProvider,
    ensName: string,
) {
    return provider.getResolver(ensName);
}
export type GetResolver = typeof getResolver;

export async function getDefaultEnsTextRecord(
    provider: ethers.providers.JsonRpcProvider,
    ensName: string,
) {
    const resolver = await provider.getResolver(ensName);

    if (!resolver) {
        throw Error(`No resolver for ${ensName}`);
    }
    return {
        email: await resolver.getText('email'),
        url: await resolver.getText('url'),
        twitter: await resolver.getText('com.twitter'),
        github: await resolver.getText('com.github'),
    };
}
export type GetDefaultEnsTextRecord = typeof getDefaultEnsTextRecord;

export async function executeTransaction(tx: Executable) {
    return tx.method(...tx.args);
}
export type ExecuteTransaction = typeof executeTransaction;

export function getConractInstance(
    address: string,
    fragements: string[],
    provider: ethers.providers.JsonRpcProvider,
) {
    const resovlerInterface = new ethers.utils.Interface(fragements);

    return new ethers.Contract(
        address,
        resovlerInterface,
        provider.getSigner(),
    );
}
export type GetConractInstance = typeof getConractInstance;
