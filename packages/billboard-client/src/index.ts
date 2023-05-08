import { ethers } from 'ethers';
import winston from 'winston';
import { getBillboardClientApp } from './getBillboardClientApp';
import { getDatabase } from './persitance/getDatabase';

const main = async () => {
    const rpcUrl = process.env['RPC'];
    const provider = new ethers.providers.JsonRpcProvider(rpcUrl);

    const database = await getDatabase(winston.createLogger());

    return getBillboardClientApp(provider, database);
};

main();
