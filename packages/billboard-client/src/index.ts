import { ethers } from 'ethers';
import winston from 'winston';
import { getBillboardClientApp } from './getBillboardClientApp';
import { getDatabase } from './persitance/getDatabase';
import 'dotenv/config';

const main = async () => {
    const rpcUrl = process.env['RPC'];
    const port = process.env['PORT'];

    if (!rpcUrl) {
        throw new Error('RPC url not provided');
    }
    if (!port) {
        throw new Error('Port not provided');
    }
    const provider = new ethers.providers.JsonRpcProvider(rpcUrl);

    const database = await getDatabase(
        winston.createLogger({
            transports: [new winston.transports.Console()],
        }),
    );

    await getBillboardClientApp(provider, database, Number(port));
};

main();
