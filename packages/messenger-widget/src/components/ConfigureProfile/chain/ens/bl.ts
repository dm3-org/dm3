import { createAlias } from '@dm3-org/dm3-lib-delivery-api';
import { Account, SignedUserProfile } from '@dm3-org/dm3-lib-profile';
import { ethersHelper, stringify } from '@dm3-org/dm3-lib-shared';
import { ethers } from 'ethers';
import { closeLoader, startLoader } from '../../../Loader/Loader';
import { NAME_TYPE } from '../common';

// method to check ENS name is valid or not
const isEnsNameValid = async (
    mainnetProvider: ethers.providers.StaticJsonRpcProvider,
    ensName: string,
    ethAddress: string,
    setError: (type: NAME_TYPE | undefined, msg: string) => void,
): Promise<boolean> => {
    const isValidEnsName = ethers.utils.isValidName(ensName);
    if (!isValidEnsName) {
        setError(NAME_TYPE.ENS_NAME, 'Invalid ENS name');
        return false;
    }

    const address = await ethersHelper.resolveOwner(mainnetProvider!, ensName);

    if (address === null) {
        setError(NAME_TYPE.ENS_NAME, 'Resolver not found');
        return false;
    }

    const owner = await ethersHelper.resolveName(mainnetProvider!, ensName);

    if (
        owner &&
        ethersHelper.formatAddress(owner) !==
            ethersHelper.formatAddress(ethAddress!)
    ) {
        setError(
            NAME_TYPE.ENS_NAME,
            'You are not the owner/manager of this name',
        );
        return false;
    }

    return true;
};

export const submitEnsNameTransaction = async (
    mainnetProvider: ethers.providers.StaticJsonRpcProvider,
    account: Account,
    ethAddress: string,
    dsToken: string,
    setLoaderContent: (content: string) => void,
    ensName: string,
    setEnsNameFromResolver: Function,
    setError: (type: NAME_TYPE | undefined, msg: string) => void,
) => {
    try {
        // start loader
        setLoaderContent('Publishing profile...');
        startLoader();

        const isValid = await isEnsNameValid(
            mainnetProvider,
            ensName,
            ethAddress,
            setError,
        );

        if (!isValid) {
            closeLoader();
            return;
        }

        const tx = await getPublishProfileOnchainTransaction(
            mainnetProvider,
            account,
            ensName!,
        );

        if (tx) {
            await createAlias(
                account!,
                mainnetProvider!,
                account!.ensName,
                ensName!,
                dsToken,
            );
            const response = await ethersHelper.executeTransaction(tx);
            await response.wait();
            setEnsNameFromResolver(ensName);
        } else {
            throw Error('Error creating publish transaction');
        }
    } catch (e: any) {
        const check = e.toString().includes('user rejected transaction');
        setError(
            NAME_TYPE.ENS_NAME,
            check
                ? 'User rejected transaction'
                : 'You are not the owner/manager of this name',
        );
    }

    // stop loader
    closeLoader();
};

export async function getPublishProfileOnchainTransaction(
    mainnetProvider: ethers.providers.StaticJsonRpcProvider,
    account: Account,
    ensName: string,
) {
    if (!account) {
        throw Error('No account');
    }
    if (!account.profile) {
        throw Error('No profile');
    }
    if (!account.profileSignature) {
        throw Error('No signature');
    }

    const ethersResolver = await ethersHelper.getResolver(
        mainnetProvider,
        ensName,
    );

    if (!ethersResolver) {
        throw Error('No resolver found');
    }

    const resolver = ethersHelper.getConractInstance(
        ethersResolver.address,
        [
            'function setText(bytes32 node, string calldata key, string calldata value) external',
        ],
        mainnetProvider,
    );

    const signedUserProfile: SignedUserProfile = {
        profile: account.profile,
        signature: account.profileSignature,
    };
    const node = ethers.utils.namehash(ensName);

    const jsonPrefix = 'data:application/json,';
    const key = 'network.dm3.profile';
    const value = jsonPrefix + stringify(signedUserProfile);

    return {
        method: resolver.setText,
        args: [node, key, value],
    };
}
