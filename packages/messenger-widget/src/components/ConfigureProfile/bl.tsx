import React from 'react';
import { ethers } from 'ethers';
import {
    Actions,
    ConnectionType,
    ModalStateType,
} from '../../utils/enum-type-utils';
import { checkEnsDM3Text } from '../../utils/ens-utils';
import { globalConfig, log } from '@dm3-org/dm3-lib-shared';
import { closeLoader, startLoader } from '../Loader/Loader';
import { removeAlias } from '../../adapters/offchain-resolver-api';
import { ConfigureEnsProfile } from './chain/ens/ConfigureEnsProfile';
import { Dm3Name } from '../../hooks/topLevelAlias/nameService/Dm3Name';
import { ConfigureGenomeProfile } from './chain/genome/ConfigureGenomeProfile';
import { Account, ProfileKeys, hasUserProfile } from '@dm3-org/dm3-lib-profile';
import { ConfigureCloudNameProfile } from './dm3Names/cloudName/ConfigureCloudNameProfile';
import { ConfigureOptimismNameProfile } from './dm3Names/optimismName/ConfigureOptimismNameProfile';

export const PROFILE_INPUT_FIELD_CLASS =
    'profile-input font-weight-400 font-size-14 border-radius-6 w-100 line-height-24';

export const BUTTON_CLASS =
    'configure-btn font-weight-400 font-size-12 border-radius-4 line-height-24';

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
    dispatch({
        type: ModalStateType.ShowPreferencesModal,
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

// method to remove aliad
export const removeAliasFromDm3Name = async (
    resolverBackendUrl: string,
    profileKeys: ProfileKeys,
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
            resolverBackendUrl as string,
            profileKeys.signingKeyPair.privateKey,
        );

        if (result) {
            dispatch({
                type: ConnectionType.ChangeAccount,
                payload: {
                    ...account!,
                    ensName: ethAddress + globalConfig.ADDR_ENS_SUBDOMAIN(),
                },
            });

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
    resolverBackendUrl: string,
    mainnetProvider: ethers.providers.StaticJsonRpcProvider,
    account: Account,
    setExistingDm3Name: Function,
) => {
    try {
        if (account) {
            const dm3NameService = new Dm3Name(mainnetProvider);
            const dm3Name = await dm3NameService.resolveAliasToTLD(
                account.ensName,
                resolverBackendUrl,
            );
            // Not a DM3 name -> 0xa966.beta-addr.dm3.eth
            // Its DM3 name -> bob.beta-user.dm3.eth
            // Checks user sub domain for setting DM3 name
            setExistingDm3Name(
                dm3Name.endsWith(globalConfig.USER_ENS_SUBDOMAIN())
                    ? dm3Name
                    : null,
            );
        } else {
            setExistingDm3Name(null);
        }
    } catch (error) {
        console.log('dm3 name : ', error);
        setExistingDm3Name(null);
    }
};

const enum NAME_SERVICES {
    ENS = 'Ethereum Network - Ethereum Name Service (ENS)',
    GENOME = 'Gnosis Network - Genome/SpaceID',
    OPTIMISM = 'Optimism Network',
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

export const fetchComponent = (name: string, chainId: string) => {
    switch (name) {
        case NAME_SERVICES.ENS:
            if (chainId === '11155111') {
                return <ConfigureEnsProfile chainToConnect={11155111} />;
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

export const fetchChainIdFromServiceName = (name: string, chainId: string) => {
    switch (name) {
        case NAME_SERVICES.ENS:
            if (chainId === '11155111') {
                return Number(chainId);
            }
            return namingServices[0].chainId;
        case NAME_SERVICES.GENOME:
            return namingServices[1].chainId;
        default:
            return namingServices[0].chainId;
    }
};

const enum DM3_NAME_SERVICES {
    CLOUD = 'Cloud-Service by dm3 (... .user.dm3.eth)',
    OPTIMISM = 'Optimism (... .op.dm3.eth)',
}

export const dm3NamingServices = [
    {
        name: DM3_NAME_SERVICES.CLOUD,
    },
    {
        name: DM3_NAME_SERVICES.OPTIMISM,
    },
];

export const fetchDM3NameComponent = (name: string) => {
    switch (name) {
        case DM3_NAME_SERVICES.CLOUD:
            return <ConfigureCloudNameProfile />;
        case DM3_NAME_SERVICES.OPTIMISM:
            const chainToConnect = 10;
            return (
                <ConfigureOptimismNameProfile chainToConnect={chainToConnect} />
            );
    }
};
