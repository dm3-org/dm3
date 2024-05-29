import { ethers } from 'ethers';

export async function getWeb3Provider(
    env: NodeJS.ProcessEnv,
): Promise<ethers.providers.JsonRpcProvider> {
    const readKey = (keyName: string) => {
        const key = env[keyName];
        if (!key) {
            throw Error(`Missing ${keyName} in env`);
        }

        return key;
    };

    const rpc = readKey('RPC');
    const provider = new ethers.providers.JsonRpcProvider(rpc);
    //Autodected the current network
    const nw = await provider.getNetwork();

    return new ethers.providers.JsonRpcProvider(rpc, {
        ...nw,
        ensAddress: '0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e',
    });
}
