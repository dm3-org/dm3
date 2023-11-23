import { hasUserProfile, SignedUserProfile } from 'dm3-lib-profile';
import {
    Actions,
    CacheType,
    ConnectionType,
    GlobalState,
    ModalStateType,
} from '../../utils/enum-type-utils';
import { claimSubdomain, removeAlias } from 'dm3-lib-offchain-resolver-api';
import { createAlias, getAliasChain } from 'dm3-lib-delivery-api';
import { Connection } from '../../interfaces/web3';
import { globalConfig, ethersHelper, stringify } from 'dm3-lib-shared';
import { ethers } from 'ethers';
import { closeLoader, startLoader } from '../Loader/Loader';
import { setContactHeightToMaximum } from '../Contacts/bl';
import { checkEnsDM3Text } from '../../utils/ens-utils';
import { getLastDm3Name } from '../../utils/common-utils';

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
export const openConfigurationModal = (dispatch: React.Dispatch<Actions>) => {
    dispatch({
        type: ModalStateType.IsProfileConfigurationPopupActive,
        payload: true,
    });
};

// method to close the profile configuration modal
export const closeConfigurationModal = (
    setDm3Name: Function,
    setEnsName: Function,
    setErrorMsg: Function,
    setShowError: Function,
    dispatch: React.Dispatch<Actions>,
) => {
    setDm3Name('');
    setEnsName('');
    setErrorMsg('');
    setShowError(undefined);
    dispatch({
        type: ModalStateType.IsProfileConfigurationPopupActive,
        payload: false,
    });
};

// method to fetch ENS name
export const getEnsName = async (
    state: GlobalState,
    setEnsNameFromResolver: Function,
) => {
    if (state.connection.provider && state.connection.ethAddress) {
        const isAddrEnsName = state.connection.account?.ensName?.endsWith(
            globalConfig.ADDR_ENS_SUBDOMAIN(),
        );
        const name = await state.connection.provider.lookupAddress(
            state.connection.ethAddress,
        );
        if (name && !isAddrEnsName) {
            const hasProfile = await hasUserProfile(
                state.connection.provider,
                name,
            );
            const dm3ProfileRecordExists = await checkEnsDM3Text(state, name);
            hasProfile &&
                dm3ProfileRecordExists &&
                setEnsNameFromResolver(name);
        }
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
        setError('Name is not available', NAME_TYPE.DM3_NAME);
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

        const result = await removeAlias(
            dm3UserEnsName,
            process.env.REACT_APP_RESOLVER_BACKEND as string,
            state.userDb!.keys.signingKeyPair.privateKey,
        );

        if (result) {
            dispatch({
                type: ConnectionType.ChangeAccount,
                payload: {
                    ...state.connection.account!,
                    ensName:
                        state.connection.ethAddress +
                        globalConfig.ADDR_ENS_SUBDOMAIN(),
                },
            });

            setContactHeightToMaximum(true);
            closeLoader();
            return true;
        } else {
            closeLoader();
            return false;
        }
    } catch (e) {
        setError('Failed to remove alias', e);
        closeLoader();
        return false;
    }
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

    const owner = await ethersHelper.resolveName(
        state.connection.provider!,
        ensName,
    );

    if (
        owner &&
        ethersHelper.formatAddress(owner) !==
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

export const validateName = (username: string): boolean => {
    return (
        username.length > 3 &&
        !username.includes('.') &&
        ethers.utils.isValidName(username)
    );
};

export const validateEnsName = (username: string): boolean => {
    return ethers.utils.isValidName(username);
};

export const fetchExistingDM3Name = async (
    state: GlobalState,
    setExistingDm3Name: Function,
) => {
    try {
        if (state.connection.account && state.connection.provider) {
            const dm3Names: any = await getAliasChain(
                state.connection.account,
                state.connection.provider,
            );
            let dm3Name;
            if (dm3Names && dm3Names.length) {
                dm3Name = getLastDm3Name(dm3Names);
            }
            setExistingDm3Name(dm3Name ? dm3Name : null);
        } else {
            setExistingDm3Name(null);
        }
    } catch (error) {
        setExistingDm3Name(null);
    }
};
