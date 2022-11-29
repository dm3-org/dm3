import { ethers } from 'ethers';
import { EncryptionEnvelop, Envelop } from '../messaging/Messaging';

export interface EthBalanceFilterSettings {
    ethHigherOrEqualThan: string;
}

export async function ethBalanceFilter(
    from: string,
    settings: EthBalanceFilterSettings,
    getEthBalance: (address: string) => Promise<ethers.BigNumber>,
): Promise<boolean> {
    return (await getEthBalance(from)).gte(
        ethers.BigNumber.from(settings.ethHigherOrEqualThan),
    );
}
