import { ethers } from 'ethers';
import { EncryptionEnvelop, Envelop } from '../messaging/Messaging';

export interface NonceFilterSettings {
    nonceHigherOrEqualThan: number;
}

export async function nonceFilter(
    from: string,
    settings: NonceFilterSettings,
    getNonce: (address: string) => Promise<number>,
): Promise<boolean> {
    return (await getNonce(from)) >= settings.nonceHigherOrEqualThan;
}
