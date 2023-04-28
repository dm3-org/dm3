import { ethers } from 'ethers';
import { getOwnDm3Profile } from './billboard/dm3/getOwnDm3Profile';
import { getBillboardClientApp } from './getBillboardClientApp';

const main = async () => {
    const rpcUrl = process.env['RPC'];
    const provider = new ethers.providers.JsonRpcProvider(rpcUrl);
    const { profile } = await getOwnDm3Profile(provider);

    getBillboardClientApp(provider, profile);
};

main();
