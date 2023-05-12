import { ethers } from 'ethers';
import { Billboard, dsConnector } from './DsConnector';
import { IDatabase } from '../../persitance/getDatabase';
import { IDsConnectorService } from './IDsConnectorService';
import { Message } from 'dm3-lib-messaging';

export async function DsConnectorService(
    db: IDatabase,
    provider: ethers.providers.JsonRpcProvider,
    billboards: Billboard[],
    onMessage: (idBillboard: string, message: Message) => Promise<void>,
): Promise<IDsConnectorService> {
    const _instance = dsConnector(db, provider, billboards, onMessage);
    //We've to wait for the connection to be established before we can return an instance
    // of the DsConnectorService
    await _instance.connect();

    const { getConnectedBillboards, disconnect } = _instance;
    return { getConnectedBillboards, disconnect };
}
