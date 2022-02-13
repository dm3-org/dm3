import { ethers } from 'ethers';
import { Keys } from '../src/lib/Web3Provider';

export interface Session {
    account: string;
    challenge?: string;
    token?: string;
    ttl?: undefined;
    socketId?: string;
    encryptedKeys?: Keys;
}

export function checkToken(
    sessions: Map<string, Session>,
    accountAddress: string,
    token: string,
): boolean {
    const account = ethers.utils.getAddress(accountAddress);
    const session = sessions.get(account);
    const passed = session && session?.token === token;
    console.log(
        `- Token check for ${account}: ${passed ? 'PASSED' : 'FAILED'}`,
    );
    return passed ? true : false;
}
