import { ethersHelper } from '@dm3-org/dm3-lib-shared';
import { ethers } from 'ethers';
import { NAME_TYPE } from '../../../chain/common';
import { getDm3NameRegistrar } from './getDm3NameRegistrar';

export const registerOpName = async (
    provider: ethers.providers.StaticJsonRpcProvider,
    setError: Function,
    opName: string,
) => {
    const isAvailable = await isOpNameAvailable(provider, opName, setError);
    if (!isAvailable) {
        return false;
    }
    console.log('OP name is available');

    const dm3NameRegistrar = getDm3NameRegistrar(provider);

    const label = opName.split('.')[0];
    const res = await ethersHelper.executeTransaction({
        method: dm3NameRegistrar.register,
        args: [label],
    });

    console.log('res', res);
    await res.wait();
    return true;
};

const isOpNameAvailable = async (
    provider: ethers.providers.StaticJsonRpcProvider,
    opName: string,
    setError: Function,
) => {
    const isValidEnsName = ethers.utils.isValidName(opName);
    if (!isValidEnsName) {
        console.log('Invalid OP name');
        setError('Invalid OP name', NAME_TYPE.DM3_NAME);
        return false;
    }

    const dm3NameRegistrar = getDm3NameRegistrar(provider);

    const node = ethers.utils.namehash(opName);
    const owner = await dm3NameRegistrar.owner(node);

    if (owner !== ethers.constants.AddressZero) {
        console.log('name already claimed');
        setError('name already claimed ', NAME_TYPE.DM3_NAME);
        return false;
    }

    return true;
};
