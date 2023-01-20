import * as Lib from 'dm3-lib/dist.backend';
import { ethers } from 'ethers';
import { IDatabase } from './persistance/getDatabase';

export interface WithLocals {
    locals: Record<string, any> &
        Record<'db', IDatabase> &
        Record<'deliveryServicePrivateKey', string> &
        Record<
            'deliveryServiceProperties',
            Lib.delivery.DeliveryServiceProperties
        > &
        Record<'getWeb3Provider', Lib.web3provider.GetWeb3Provider>;
}
