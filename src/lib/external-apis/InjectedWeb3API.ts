import { ethers } from 'ethers';
import { UserDB } from '..';
import { Keys } from '../account/Account';
import { decryptSafely, EthEncryptedData } from '../encryption/Encryption';
import { Connection } from '../web3-provider/Web3Provider';

export async function prersonalSign(
    provider: ethers.providers.JsonRpcProvider,
    account: string,
    message: string,
): Promise<any> {
    return provider.send('personal_sign', [account, message]);
}

export async function getPublicKey(
    provider: ethers.providers.JsonRpcProvider,
    account: string,
): Promise<string> {
    return provider.send('eth_getEncryptionPublicKey', [account]);
}

export async function decryptMessage(
    userDb: UserDB,
    encryptedData: EthEncryptedData,
): Promise<string> {
    return decryptSafely({
        encryptedData,
        privateKey: (userDb.keys as Keys).privateMessagingKey as string,
    }) as string;
}

export async function decryptUsingProvider(
    provider: ethers.providers.JsonRpcProvider,
    encryptedData: string,
    account: string,
): Promise<string> {
    return provider.send('eth_decrypt', [encryptedData, account]);
}

export async function requestAccounts(
    provider: ethers.providers.JsonRpcProvider,
): Promise<string> {
    return (await provider.send('eth_requestAccounts', []))[0];
}

export async function lookupAddress(
    provider: ethers.providers.JsonRpcProvider,
    accountAddress: string,
): Promise<string | null> {
    return provider.lookupAddress(accountAddress);
}

export async function resolveName(
    provider: ethers.providers.JsonRpcProvider,
    name: string,
): Promise<string | null> {
    return provider.resolveName(name);
}

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
