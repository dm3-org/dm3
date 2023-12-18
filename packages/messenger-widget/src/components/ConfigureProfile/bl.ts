import { Account, hasUserProfile, SignedUserProfile } from 'dm3-lib-profile';
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
import { ethersHelper, globalConfig, stringify } from 'dm3-lib-shared';
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
    ethAddress: string,
    account: Account,
    setEnsNameFromResolver: Function,
) => {
    if (ethAddress) {
        const isAddrEnsName = account.ensName?.endsWith(
            globalConfig.ADDR_ENS_SUBDOMAIN(),
        );
        const name = await state.connection.mainnetProvider.lookupAddress(
            ethAddress,
        );
        if (name && !isAddrEnsName) {
            const hasProfile = await hasUserProfile(
                state.connection.mainnetProvider,
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
    account: Account,
    dsToken: string,
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
            account!.ensName,
            state.userDb!.keys.signingKeyPair.privateKey,
        );

        await createAlias(
            account!,
            state.connection.mainnetProvider!,
            account!.ensName,
            ensName,
            dsToken!,
        );

        dispatch({
            type: ConnectionType.ChangeAccount,
            payload: {
                ...account!,
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
    account: Account,
    ethAddress: string,
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
                    ...account!,
                    ensName: ethAddress + globalConfig.ADDR_ENS_SUBDOMAIN(),
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
    account: Account,
    setExistingDm3Name: Function,
) => {
    try {
        if (account) {
            const dm3Names: any = await getAliasChain(
                account,
                state.connection.mainnetProvider,
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
