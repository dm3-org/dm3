import { ethers } from 'ethers';
import { Billboard, dsManager } from './DsManagerImpl';
import { IDatabase } from '../../persitance/getDatabase';
import { IDsManagerService } from './IDsManagerService';
import { Message } from '@dm3-org/dm3-lib-messaging';

/**
 * Creates and returns an instance of a delivery service connector service that connects to and manages
 * delivery service connections for billboards.
 *
 * @param db - The database instance used to store messages.
 * @param provider - The Ethereum JSON RPC provider instance.
 * @param billboards - An array of billboards to connect to.
 * @param onMessage - A function that handles incoming messages.
 * @returns A promise that resolves to an instance of a delivery service connector service.
 */
export async function DsManagerService(
    db: IDatabase,
    provider: ethers.providers.JsonRpcProvider,
    billboards: Billboard[],
    onMessage: (idBillboard: string, message: Message) => Promise<void>,
): Promise<IDsManagerService> {
    const _instance = dsManager(db, provider, billboards, onMessage);
    //We've to wait for the connection to be established before we can return an instance
    // of the DsConnectorService
    await _instance.connect();

    const { getConnectedBillboards, disconnect } = _instance;
    return { getConnectedBillboards, disconnect };
}
