import { getResolverContract, setupENS } from '@siddomains/ui';
//@ts-ignore
import SID from '@siddomains/sidjs';
//@ts-ignore
import { ethers } from 'ethers';
import { log } from '..';

export interface Executable {
    method: (...args: any[]) => Promise<ethers.providers.TransactionResponse>;
    args: any[];
}

export async function prersonalSign(
    provider: ethers.providers.JsonRpcProvider,
    account: string,
    message: string,
): Promise<any> {
    return provider.send('personal_sign', [message, account]);
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
    const sidAddress = '0x08CEd32a7f3eeC915Ba84415e9C07a7286977956';

    const sid = new SID({ provider, sidAddress });

    const { name } = await sid.getName(accountAddress);
    return name;
}
export type LookupAddress = typeof lookupAddress;

export async function resolveName(
    provider: ethers.providers.JsonRpcProvider,
    sidname: string,
): Promise<string | null> {
    const sidAddress = '0x08CEd32a7f3eeC915Ba84415e9C07a7286977956';

    const sid = new SID({ provider, sidAddress });

    const sidName = sid.name(sidname);
    if (!sidName) {
        return null;
    }

    const resolvedAddr = await sidName.getAddress();

    if (!resolvedAddr) {
        return null;
    }
    return resolvedAddr;
}
export type ResolveName = typeof resolveName;

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
//Replace with BNB SpaceId Contract
export async function getEnsTextRecord(
    provider: ethers.providers.JsonRpcProvider,
    accountAddress: string,
    recordKey: string,
) {
    const sidRegistryAddress = '0x08CEd32a7f3eeC915Ba84415e9C07a7286977956';
    const sid = new SID({ provider, sidAddress: sidRegistryAddress });
    const { name } = await sid.getName(accountAddress);
    if (!name) {
        return;
    }
    const sidNameObject = await sid.name(name);

    const text = (await sidNameObject.getText(recordKey)) as Promise<
        string | undefined
    >;

    return text;
}
export type GetEnsTextRecord = typeof getEnsTextRecord;

export async function getResolver(
    provider: ethers.providers.JsonRpcProvider,
    sidName: string,
) {
    const sidAddress = '0x08CEd32a7f3eeC915Ba84415e9C07a7286977956';

    const sid = new SID({ provider, sidAddress });
    const sidNameObject = await sid.name(sidName);

    const resolver = await sidNameObject.getResolver();

    return new ethers.providers.Resolver(provider, resolver, sidName);
}
export type GetResolver = typeof getResolver;

export async function getDefaultEnsTextRecord(
    provider: ethers.providers.JsonRpcProvider,
    ensName: string,
) {
    const resolver = await getResolver(provider, ensName);

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
