import { ethers } from 'ethers';
import { EncryptionEnvelop, Envelop } from '../messaging/Messaging';

export interface NonceFilterSettings {
    nonceHigherOrEqualThan: number;
}

export async function nonceFilter(
    envelop: Envelop | EncryptionEnvelop,
    settings: NonceFilterSettings,
    getNonce: (address: string) => Promise<number>,
): Promise<boolean> {
    const from = (envelop as EncryptionEnvelop).encryptionVersion
        ? (envelop as EncryptionEnvelop).from
        : (envelop as Envelop).message.from;

    return (await getNonce(from)) >= settings.nonceHigherOrEqualThan;
}
