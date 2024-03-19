import { ethers } from 'ethers';
import { IDatabase } from './persistence/getDatabase';
import { DeliveryServiceProperties } from '@dm3-org/dm3-lib-delivery';

export interface WithLocals {
    locals: Record<string, any> &
        Record<'db', IDatabase> &
        Record<'deliveryServicePrivateKey', string> &
        Record<'deliveryServiceProperties', DeliveryServiceProperties> &
        Record<'web3Provider', ethers.providers.JsonRpcProvider>;
}
