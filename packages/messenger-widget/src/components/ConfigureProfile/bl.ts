import { formatAddress, SignedUserProfile } from 'dm3-lib-profile';
import {
    Actions,
    ConnectionType,
    GlobalState,
    ModalStateType,
} from '../../utils/enum-type-utils';
import { claimSubdomain, removeAlias } from 'dm3-lib-offchain-resolver-api';
import { createAlias } from 'dm3-lib-delivery-api';
import { Connection } from '../../interfaces/web3';
import { globalConfig, ethersHelper, stringify } from 'dm3-lib-shared';
import { ethers } from 'ethers';
import { closeLoader, startLoader } from '../Loader/Loader';
import { setContactHeightToMaximum } from '../Contacts/bl';

export const PROFILE_INPUT_FIELD_CLASS =
    'profile-input font-weight-400 font-size-14 border-radius-6 w-100 line-height-24';

export const BUTTON_CLASS =
    'configure-btn font-weight-400 font-size-12 border-radius-4 line-height-24';

export enum NAME_TYPE {
    ENS_NAME,
    DM3_NAME,
}

export enum ACTION_TYPE {
    CONFIGURE,
    REMOVE,
}

// method to open the profile configuration modal
export const openConfigurationModal = () => {
    const modal: HTMLElement = document.getElementById(
        'configuration-modal',
    ) as HTMLElement;
    modal.style.display = 'block';
};

// method to close the profile configuration modal
export const closeConfigurationModal = (
    setDm3Name: Function,
    setEnsName: Function,
    setErrorMsg: Function,
    setShowError: Function,
) => {
    const modal: HTMLElement = document.getElementById(
        'configuration-modal',
    ) as HTMLElement;
    modal.style.display = 'none';
    setDm3Name('');
    setEnsName('');
    setErrorMsg('');
    setShowError(undefined);
};

// method to fetch address ENS name
export const getAddrEnsName = async (
    state: GlobalState,
    setAddressFromContext: Function,
) => {
    if (state.connection.ethAddress && state.connection.provider) {
        const addressEnsName =
            state.connection.ethAddress + globalConfig.ADDR_ENS_SUBDOMAIN();
        const address = await state.connection.provider.resolveName(
            addressEnsName,
        );

        if (
            address &&
            formatAddress(address) ===
                formatAddress(state.connection.ethAddress)
        ) {
            setAddressFromContext(addressEnsName);
        }
    }
};

// method to fetch ENS name
export const getEnsName = async (
    state: GlobalState,
    setEnsNameFromResolver: Function,
) => {
    if (state.connection.ethAddress && state.connection.provider) {
        const name = await state.connection.provider.lookupAddress(
            state.connection.ethAddress,
        );
        setEnsNameFromResolver(name);
    }
};

// method to set new DM3 username
export const submitDm3UsernameClaim = async (
    state: GlobalState,
    dm3UserEnsName: string,
    dispatch: React.Dispatch<Actions>,
    setError: Function,
) => {
    try {
        // start loader
        dispatch({
            type: ModalStateType.LoaderContent,
            payload: 'Publishing profile...',
        });

        startLoader();

        const ensName = dm3UserEnsName! + globalConfig.USER_ENS_SUBDOMAIN();

        await claimSubdomain(
            dm3UserEnsName! + globalConfig.USER_ENS_SUBDOMAIN(),
            process.env.REACT_APP_RESOLVER_BACKEND as string,
            state.connection.account!.ensName,
            state.userDb!.keys.signingKeyPair.privateKey,
        );

        await createAlias(
            state.connection.account!,
            state.connection.provider!,
            state.connection.account!.ensName,
            ensName,
            state.auth.currentSession!.token!,
        );

        dispatch({
            type: ConnectionType.ChangeAccount,
            payload: {
                ...state.connection.account!,
                ensName: ensName,
            },
        });

        setContactHeightToMaximum(true);
    } catch (e) {
        setError(
            'Name is not available or Name must not have blancs',
            NAME_TYPE.DM3_NAME,
        );
    }

    // stop loader
    closeLoader();
};

// method to remove aliad
export const removeAliasFromDm3Name = async (
    state: GlobalState,
    dm3UserEnsName: string,
    dispatch: React.Dispatch<Actions>,
    setError: Function,
) => {
    try {
        dispatch({
            type: ModalStateType.LoaderContent,
            payload: 'Removing alias...',
        });

        startLoader();

        const ensName = dm3UserEnsName! + globalConfig.USER_ENS_SUBDOMAIN();

        await removeAlias(
            dm3UserEnsName! + globalConfig.USER_ENS_SUBDOMAIN(),
            process.env.REACT_APP_RESOLVER_BACKEND as string,
            state.userDb!.keys.signingKeyPair.privateKey,
        );

        dispatch({
            type: ConnectionType.ChangeAccount,
            payload: {
                ...state.connection.account!,
                ensName: ensName,
            },
        });

        setContactHeightToMaximum(true);
    } catch (e) {
        setError('Failed to remove alias', e);
    }

    closeLoader();
};

// method to create transaction to add new ENS name
async function getPublishProfileOnchainTransaction(
    connection: Connection,
    ensName: string,
) {
    if (!connection.provider) {
        throw Error('No provider');
    }
    if (!connection.account) {
        throw Error('No account');
    }
    if (!connection.account.profile) {
        throw Error('No profile');
    }
    if (!connection.account.profileSignature) {
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
        profile: connection.account.profile,
        signature: connection.account.profileSignature,
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

// method to check ENS name is valid or not
const isEnsNameValid = async (
    state: GlobalState,
    ensName: string,
    setError: Function,
): Promise<boolean> => {
    const isValidEnsName = ethers.utils.isValidName(ensName);
    if (!isValidEnsName) {
        setError('Invalid ENS name', NAME_TYPE.ENS_NAME);
        return false;
    }

    const address = await ethersHelper.resolveOwner(
        state.connection.provider!,
        ensName,
    );

    if (address === null) {
        setError('Resolver not found', NAME_TYPE.ENS_NAME);
        return false;
    }

    if (
        ethersHelper.formatAddress(address) !==
        ethersHelper.formatAddress(state.connection.ethAddress!)
    ) {
        setError(
            'You are not the owner/manager of this name',
            NAME_TYPE.ENS_NAME,
        );
        return false;
    }

    return true;
};

// method to set new ENS name via transaction
export const submitEnsNameTransaction = async (
    state: GlobalState,
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

        const isValid = await isEnsNameValid(state, ensName, setError);

        if (!isValid) {
            closeLoader();
            return;
        }

        const tx = await getPublishProfileOnchainTransaction(
            state.connection,
            ensName!,
        );

        if (tx) {
            await createAlias(
                state.connection.account!,
                state.connection.provider!,
                state.connection.account!.ensName,
                ensName!,
                state.auth.currentSession!.token!,
            );
            const response = await ethersHelper.executeTransaction(tx);
            await response.wait();
            setEnsNameFromResolver(ensName);
        } else {
            throw Error('Error creating publish transaction');
        }
    } catch (e) {
        setError(
            'You are not the owner/manager of this name',
            NAME_TYPE.ENS_NAME,
        );
    }

    // stop loader
    closeLoader();
};
