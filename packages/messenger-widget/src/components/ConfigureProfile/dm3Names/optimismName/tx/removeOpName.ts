import { ethersHelper } from '@dm3-org/dm3-lib-shared';
import { ethers } from 'ethers';
import { getDm3NameRegistrar } from './getDm3NameRegistrar';

export async function removeOpName(
    opProvider: ethers.providers.StaticJsonRpcProvider,
) {
    const dm3NameRegistrar = getDm3NameRegistrar(opProvider);

    //Passing an empty name to the contracts deletes their corrospending name
    const emptyName = '';
    const res = await ethersHelper.executeTransaction({
        method: dm3NameRegistrar.register,
        args: [ethers.utils.toUtf8Bytes(emptyName)],
    });

    console.log('res', res);
    await res.wait();
    return true;
}
