import { ethers } from 'ethers';
import { Actions, ModalStateType } from '../../../../../utils/enum-type-utils';
import { closeLoader, startLoader } from '../../../../Loader/Loader';
import { getConractInstance } from '@dm3-org/dm3-lib-shared/dist/ethersHelper';
import { NAME_TYPE } from '../../../chain/common';

export const registerOpName = async (
    provider: ethers.providers.StaticJsonRpcProvider,
    dispatch: React.Dispatch<Actions>,
    setError: Function,
    opName: string,
) => {
    dispatch({
        type: ModalStateType.LoaderContent,
        payload: 'Publishing profile...',
    });

    startLoader();

    const isAvailable = await isOpNameAvailable(provider, opName, setError);

    if (!isAvailable) {
        closeLoader();
        return;
    }
    console.log('OP name is available');
};

const isOpNameAvailable = async (
    provider: ethers.providers.StaticJsonRpcProvider,
    opName: string,
    setError: Function,
) => {
    const isValidEnsName = ethers.utils.isValidName(opName);
    if (!isValidEnsName) {
        setError('Invalid OP name', NAME_TYPE.OP_NAME);
        return false;
    }
    const dm3NameRegistrarAddress =
        '0xF5b24cD05D6e6E9b8AC2B97cD90C38a8F2Df57FB';

    const dm3NameRegistrar = getConractInstance(
        dm3NameRegistrarAddress,
        ['function owner(bytes32 node) external view returns (address)'],
        provider!,
    );

    const node = ethers.utils.namehash(opName);
    const owner = await dm3NameRegistrar.owner(node);

    if (owner !== null) {
        setError('name already claimed ', NAME_TYPE.OP_NAME);
        return false;
    }

    return true;
};
