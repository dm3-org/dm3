import { createAlias } from '@dm3-org/dm3-lib-delivery-api';
import { ethersHelper, stringify } from '@dm3-org/dm3-lib-shared';
import {
    GlobalState,
    Actions,
    ModalStateType,
    CacheType,
} from '../../../../utils/enum-type-utils';
import { setContactHeightToMaximum } from '../../../Contacts/bl';
import { startLoader, closeLoader } from '../../../Loader/Loader';
import { NAME_TYPE } from '../../bl';
import { ethers } from 'ethers';
import { getConractInstance } from '@dm3-org/dm3-lib-shared/dist/ethersHelper';
import { Connection } from '../../../../interfaces/web3';
import { Account, SignedUserProfile } from '@dm3-org/dm3-lib-profile';

import { Address, namehash, toHex } from 'viem';

//Space id uses the namehash of the name + the GNO identifier to calculate the node
const GNO_IDENTIFIER = BigInt(
    '2702484275810670337286593638197304166435784191035983069259851825108946',
);

export function getSpaceIdNode(inputName: string): Address {
    const fullNameNode = `${inputName}.[${toHex(GNO_IDENTIFIER, {
        size: 32,
    }).slice(2)}]`;
    return namehash(fullNameNode);
}

export const isGenomeNameValid = async (
    provider: ethers.providers.StaticJsonRpcProvider,
    ensName: string,
    ethAddress: string,
    setError: Function,
) => {
    const isValidEnsName = ethers.utils.isValidName(ensName);
    if (!isValidEnsName) {
        setError('Invalid ENS name', NAME_TYPE.ENS_NAME);
        return false;
    }
    const isGenomeName = validateGenomeName(ensName);
    if (!isGenomeName) {
        setError('Genome name has to end with ', NAME_TYPE.ENS_NAME);
        return false;
    }

    //TODO move to props
    const genomeRegistryAddress = '0x5dC881dDA4e4a8d312be3544AD13118D1a04Cb17';

    const genomeRegistry = getConractInstance(
        genomeRegistryAddress,
        ['function owner(bytes32 node) external view returns (address)'],
        provider!,
    );

    const node = getSpaceIdNode(ensName);
    const owner = await genomeRegistry.owner(node);

    if (owner === null) {
        setError('owner not found', NAME_TYPE.ENS_NAME);
        return false;
    }
    if (
        owner &&
        ethersHelper.formatAddress(owner) !==
            ethersHelper.formatAddress(ethAddress!)
    ) {
        setError(
            'You are not the owner/manager of this name',
            NAME_TYPE.ENS_NAME,
        );
        return false;
    }

    return true;
};

const getPublishProfileOnchainTransaction = async (
    provider: ethers.providers.StaticJsonRpcProvider,
    account: Account,
    ensName: string,
) => {
    if (!account.profile) {
        throw Error('No profile');
    }
    if (!account.profileSignature) {
        throw Error('No signature');
    }

    const genomeResolver = '0x6D3B3F99177FB2A5de7F9E928a9BD807bF7b5BAD';

    const resolver = ethersHelper.getConractInstance(
        genomeResolver,
        [
            'function setText(bytes32 node, string calldata key, string calldata value) external',
        ],
        provider,
    );

    const signedUserProfile: SignedUserProfile = {
        profile: account.profile,
        signature: account.profileSignature,
    };

    const node = getSpaceIdNode(ensName);

    const jsonPrefix = 'data:application/json,';
    const key = 'network.dm3.profile';
    const value = jsonPrefix + stringify(signedUserProfile);

    return {
        method: resolver.setText,
        args: [node, key, value],
    };
};

export const submitGenomeNameTransaction = async (
    provider: ethers.providers.StaticJsonRpcProvider,
    dsToken: string,
    account: Account,
    dispatch: React.Dispatch<Actions>,
    ensName: string,
    ethAddress: string,
    setEnsNameFromResolver: Function,
    setError: Function,
) => {
    try {
        // start loader
        dispatch({
            type: ModalStateType.LoaderContent,
            payload: 'Publishing profile...',
        });

        startLoader();

        const isValid = await isGenomeNameValid(
            provider,
            ensName,
            ethAddress,
            setError,
        );

        if (!isValid) {
            closeLoader();
            return;
        }

        const tx = await getPublishProfileOnchainTransaction(
            provider,
            account,
            ensName!,
        );
        //TODO Handle crosschain transaction
        if (tx) {
            await createAlias(
                account!,
                provider!,
                account!.ensName,
                ensName!,
                dsToken,
            );
            const response = await ethersHelper.executeTransaction(tx);
            await response.wait();
            setEnsNameFromResolver(ensName);

            dispatch({
                type: CacheType.AccountName,
                payload: ensName,
            });

            setContactHeightToMaximum(true);
        } else {
            throw Error('Error creating publish transaction');
        }
    } catch (e: any) {
        const check = e.toString().includes('user rejected transaction');
        setError(
            check
                ? 'User rejected transaction'
                : 'You are not the owner/manager of this name',
            NAME_TYPE.ENS_NAME,
        );
    }

    // stop loader
    closeLoader();
};

export const validateGenomeName = (ensName: string) => {
    return ensName.endsWith('.gno');
};
