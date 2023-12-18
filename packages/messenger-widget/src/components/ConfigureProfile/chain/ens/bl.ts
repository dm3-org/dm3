import { createAlias } from 'dm3-lib-delivery-api';
import { ethersHelper, stringify } from 'dm3-lib-shared';
import { ethers } from 'ethers';
import {
    GlobalState,
    Actions,
    ModalStateType,
    CacheType,
} from '../../../../utils/enum-type-utils';
import { setContactHeightToMaximum } from '../../../Contacts/bl';
import { startLoader, closeLoader } from '../../../Loader/Loader';
import { NAME_TYPE } from '../../bl';
import { Account, SignedUserProfile } from 'dm3-lib-profile';
import { Connection } from '../../../../interfaces/web3';

// method to check ENS name is valid or not
const isEnsNameValid = async (
    state: GlobalState,
    ensName: string,
    ethAddress: string,
    setError: Function,
): Promise<boolean> => {
    const isValidEnsName = ethers.utils.isValidName(ensName);
    if (!isValidEnsName) {
        setError('Invalid ENS name', NAME_TYPE.ENS_NAME);
        return false;
    }

    const address = await ethersHelper.resolveOwner(
        state.connection.mainnetProvider!,
        ensName,
    );

    if (address === null) {
        setError('Resolver not found', NAME_TYPE.ENS_NAME);
        return false;
    }

    const owner = await ethersHelper.resolveName(
        state.connection.mainnetProvider!,
        ensName,
    );

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

export const submitEnsNameTransaction = async (
    state: GlobalState,
    account: Account,
    ethAddress: string,
    dsToken: string,
    dispatch: React.Dispatch<Actions>,
    ensName: string,
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

        const isValid = await isEnsNameValid(
            state,
            ensName,
            ethAddress,
            setError,
        );

        if (!isValid) {
            closeLoader();
            return;
        }

        const tx = await getPublishProfileOnchainTransaction(
            state.connection,
            account,
            ensName!,
        );
        //TODO Handle crosschain transaction
        if (tx) {
            await createAlias(
                account!,
                state.connection.mainnetProvider!,
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

async function getPublishProfileOnchainTransaction(
    connection: Connection,
    account: Account,
    ensName: string,
) {
    if (!connection.provider) {
        throw Error('No provider');
    }
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
        connection.provider,
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
        connection.provider,
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
