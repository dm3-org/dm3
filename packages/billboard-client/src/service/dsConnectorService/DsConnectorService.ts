import { ethers } from 'ethers';
import { Billboard, dsConnector } from './DsConnector';
import { IDatabase } from '../../persitance/getDatabase';
import { IDsConnectorService } from './IDsConnectorService';

export async function DsConnectorService(
    db: IDatabase,
    provider: ethers.providers.JsonRpcProvider,
    billboards: Billboard[],
): Promise<IDsConnectorService> {
    const _instance = dsConnector(db, provider, billboards);
    //We've to wait for the connection to be established before we can return an instance
    // of the DsConnectorService
    await _instance.connect();

    const { getConnectedBillboards } = _instance;
    return { getConnectedBillboards };
}
