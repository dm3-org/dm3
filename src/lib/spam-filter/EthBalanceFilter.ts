import { ethers } from 'ethers';
import { EncryptionEnvelop, Envelop } from '../messaging/Messaging';

export interface EthBalanceFilterSettings {
    ethHigherOrEqualThan: string;
}

export async function ethBalanceFilter(
    envelop: Envelop | EncryptionEnvelop,
    settings: EthBalanceFilterSettings,
    getEthBalance: (address: string) => Promise<ethers.BigNumber>,
): Promise<boolean> {
    const from = (envelop as EncryptionEnvelop).encryptionVersion
        ? (envelop as EncryptionEnvelop).from
        : (envelop as Envelop).message.from;

    return (await getEthBalance(from)).gte(
        ethers.BigNumber.from(settings.ethHigherOrEqualThan),
    );
}
