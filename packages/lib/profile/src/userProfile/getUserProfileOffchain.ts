import axios from 'axios';
import { ethers } from 'ethers';
import { Account, checkAccount, SignedUserProfile } from '../Profile';
import { getDeliveryServiceClient } from '../deliveryServiceProfile/Delivery';

export async function getUserProfileOffChain(
    provider: ethers.providers.StaticJsonRpcProvider,
    account: Account | undefined,
    contact: string,
    url?: string,
): Promise<SignedUserProfile | undefined> {
    try {
        if (url) {
            const { data } = await axios.get(url);
            return data;
        }
        const { profile } = checkAccount(account);

        const fallbackUrl = `profile/${contact}`;

        const { data } = await getDeliveryServiceClient(
            profile,
            provider,
            async (url: string) => (await axios.get(url)).data,
        ).get(fallbackUrl);
        return data;
    } catch (e) {
        const { message } = e as Error;
        if (message.includes('404') || message.includes('No account')) {
            return undefined;
        }
        throw Error('Unknown API error');
    }
}
export type GetUserProfileOffChain = typeof getUserProfileOffChain;
