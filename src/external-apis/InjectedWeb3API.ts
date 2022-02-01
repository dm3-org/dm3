import { ethers } from 'ethers';

export async function prersonalSign(
    provider: ethers.providers.JsonRpcProvider,
    account: string,
    message: string,
) {
    return await provider.send('personal_sign', [account, message]);
}

export async function requestAccounts(
    provider: ethers.providers.JsonRpcProvider,
): Promise<string> {
    return (await provider.send('eth_requestAccounts', []))[0];
}
