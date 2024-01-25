import { Account, hasUserProfile } from '@dm3-org/dm3-lib-profile';
import {
    Actions,
    ConnectionType,
    GlobalState,
    ModalStateType,
} from '../../utils/enum-type-utils';
import {
    claimSubdomain,
    removeAlias,
} from '@dm3-org/dm3-lib-offchain-resolver-api';
import { createAlias, getAliasChain } from '@dm3-org/dm3-lib-delivery-api';
import { globalConfig, log } from '@dm3-org/dm3-lib-shared';
import { ethers } from 'ethers';
import { closeLoader, startLoader } from '../Loader/Loader';
import { setContactHeightToMaximum } from '../Contacts/bl';
import { checkEnsDM3Text } from '../../utils/ens-utils';
import { getLastDm3Name } from '../../utils/common-utils';
import { ConfigureGenomeProfile } from './chain/genome/ConfigureGenomeProfile';
import { ConfigureEnsProfile } from './chain/ens/ConfigureEnsProfile';
import React from 'react';
import { NAME_TYPE } from './chain/common';

// method to open the profile configuration modal
export const openConfigurationModal = (dispatch: React.Dispatch<Actions>) => {
    dispatch({
        type: ModalStateType.IsProfileConfigurationPopupActive,
        payload: true,
    });
};

// method to close the profile configuration modal
export const closeConfigurationModal = (dispatch: React.Dispatch<Actions>) => {
    dispatch({
        type: ModalStateType.IsProfileConfigurationPopupActive,
        payload: false,
    });
};

// method to fetch ENS name
export const getEnsName = async (
    mainnetProvider: ethers.providers.StaticJsonRpcProvider,
    ethAddress: string,
    account: Account,
    setEnsNameFromResolver: Function,
) => {
    try {
        if (ethAddress) {
            const isAddrEnsName = account.ensName?.endsWith(
                globalConfig.ADDR_ENS_SUBDOMAIN(),
            );
            const name = await mainnetProvider.lookupAddress(ethAddress);
            if (name && !isAddrEnsName) {
                const hasProfile = await hasUserProfile(mainnetProvider, name);
                const dm3ProfileRecordExists = await checkEnsDM3Text(
                    mainnetProvider,
                    name,
                );
                hasProfile &&
                    dm3ProfileRecordExists &&
                    setEnsNameFromResolver(name);
            }
        }
    } catch (error) {
        log(error, 'Configure profile');
    }
};

// method to set new DM3 username
export const submitDm3UsernameClaim = async (
    state: GlobalState,
    mainnetProvider: ethers.providers.StaticJsonRpcProvider,
    account: Account,
    dsToken: string,
    dm3UserEnsName: string,
    dispatch: React.Dispatch<Actions>,
    setError: Function,
    setAccount: Function,
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
            mainnetProvider!,
            account!.ensName,
            ensName,
            dsToken!,
        );

        const updatedAccount = { ...account, ensName: ensName };
        setAccount(updatedAccount);
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

export const fetchExistingDM3Name = async (
    mainnetProvider: ethers.providers.StaticJsonRpcProvider,
    account: Account,
    setExistingDm3Name: Function,
) => {
    try {
        if (account) {
            const dm3Names: any = await getAliasChain(account, mainnetProvider);
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

const enum NAME_SERVICES {
    ENS = 'Ethereum Network - Ethereum Name Service (ENS)',
    GENOME = 'Gnosis Network - Genome/SpaceID',
}

export const namingServices = [
    {
        name: NAME_SERVICES.ENS,
        chainId: 1,
    },
    {
        name: NAME_SERVICES.GENOME,
        chainId: 100,
    },
];

export const fetchComponent = (name: string) => {
    switch (name) {
        case NAME_SERVICES.ENS:
            if (process.env.REACT_APP_CHAIN_ID === '5') {
                return <ConfigureEnsProfile chainToConnect={5} />;
            }
            return <ConfigureEnsProfile chainToConnect={1} />;
        case NAME_SERVICES.GENOME:
            const genomeChainId = namingServices[1].chainId;
            return <ConfigureGenomeProfile chainToConnect={genomeChainId} />;
    }
};

export const fetchServiceFromChainId = (chainId: number): string => {
    namingServices.forEach((data) => {
        if (data.chainId === chainId) {
            return data.name;
        }
    });
    return namingServices[0].name;
};

export const fetchChainIdFromServiceName = (name: string) => {
    switch (name) {
        case NAME_SERVICES.ENS:
            if (process.env.REACT_APP_CHAIN_ID === '5') {
                return Number(process.env.REACT_APP_CHAIN_ID);
            }
            return namingServices[0].chainId;
        case NAME_SERVICES.GENOME:
            return namingServices[1].chainId;
        default:
            return namingServices[0].chainId;
    }
};
