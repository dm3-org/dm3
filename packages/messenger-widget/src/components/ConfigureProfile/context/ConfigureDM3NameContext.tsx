import { NAME_TYPE } from '../chain/common';
import { AuthContext } from '../../../context/AuthContext';
import React, { useContext, useEffect, useState } from 'react';
import { ConfigureProfileContext } from './ConfigureProfileContext';
import { DM3ConfigurationContext } from '../../../context/DM3ConfigurationContext';
import { useMainnetProvider } from '../../../hooks/mainnetprovider/useMainnetProvider';
import {
    ACTION_TYPE,
    DM3_NAME_SERVICES,
    fetchExistingDM3Name,
    removeAliasFromDm3Name,
    validateName,
} from '../bl';
import { ModalContext } from '../../../context/ModalContext';
import { useChainId } from 'wagmi';
import { supportedChains } from '../../../utils/common-utils';
import { closeLoader, startLoader } from '../../Loader/Loader';
import { ethersHelper, globalConfig } from '@dm3-org/dm3-lib-shared';
import { getRemoveOpProfileOnchainTransaction } from '../dm3Names/optimismName/tx/removeOpName';

export interface ConfigureDM3NameContextType {
    existingDm3Name: string | null;
    setExistingDm3Name: (name: string | null) => void;
    dm3Name: string;
    setDm3Name: (name: string) => void;
    showDeleteConfirmation: boolean;
    setShowDeleteConfirmation: (show: boolean) => void;
    setError: (error: string, type: NAME_TYPE | undefined) => void;
    handleNameChange: (
        e: React.ChangeEvent<HTMLInputElement>,
        type: NAME_TYPE,
    ) => void;
    handleClaimOrRemoveDm3Name: (
        type: ACTION_TYPE,
        setDisplayName: Function,
        submitDm3UsernameClaim: (dm3UserEnsName: string) => void,
    ) => void;
    updateDeleteConfirmation: (action: boolean) => void;
    getChainOfDm3Name: () => number;
}

export const ConfigureDM3NameContext =
    React.createContext<ConfigureDM3NameContextType>({
        existingDm3Name: '',
        setExistingDm3Name: (name: string | null) => {},
        dm3Name: '',
        setDm3Name: (name: string) => {},
        showDeleteConfirmation: false,
        setShowDeleteConfirmation: (show: boolean) => {},
        setError: (error: string, type: NAME_TYPE | undefined) => {},
        handleNameChange: (
            e: React.ChangeEvent<HTMLInputElement>,
            type: NAME_TYPE,
        ) => {},
        handleClaimOrRemoveDm3Name: (
            type: ACTION_TYPE,
            setDisplayName: Function,
            submitDm3UsernameClaim: (dm3UserEnsName: string) => void,
        ) => {},
        updateDeleteConfirmation: (action: boolean) => {},
        getChainOfDm3Name: () => 0,
    });

export const ConfigureDM3NameContextProvider = (props: { children?: any }) => {
    const [dm3Name, setDm3Name] = useState<string>('');

    const [existingDm3Name, setExistingDm3Name] = useState<string | null>(null);

    const [showDeleteConfirmation, setShowDeleteConfirmation] =
        useState<boolean>(false);

    const mainnetProvider = useMainnetProvider();

    const chainId = useChainId();

    const { setLoaderContent } = useContext(ModalContext);

    const { dm3Configuration } = useContext(DM3ConfigurationContext);

    const { setEnsName, onShowError, dm3NameServiceSelected } = useContext(
        ConfigureProfileContext,
    );

    const { account, ethAddress, deliveryServiceToken, profileKeys } =
        useContext(AuthContext);

    const setError = (error: string, type: NAME_TYPE | undefined) => {
        onShowError(type, error);
    };

    // handles name change event
    const handleNameChange = (
        e: React.ChangeEvent<HTMLInputElement>,
        type: NAME_TYPE,
    ) => {
        onShowError(undefined, '');
        setDm3Name(e.target.value);
        setEnsName('');
    };

    // handles claim or delete DM3 user name
    const handleClaimOrRemoveDm3Name = async (
        type: ACTION_TYPE,
        setDisplayName: Function,
        submitDm3UsernameClaim: (dm3UserEnsName: string) => void,
    ) => {
        if (type === ACTION_TYPE.CONFIGURE) {
            const name = dm3Name.trim();
            if (!name.length) {
                onShowError(NAME_TYPE.DM3_NAME, 'DM3 name cannot be empty');
                return;
            }
            const validityCheck = validateName(name, dm3NameServiceSelected);
            if (!validityCheck.isValid) {
                setError(validityCheck.error, NAME_TYPE.DM3_NAME);
                return;
            }
            await submitDm3UsernameClaim(name);
        } else {
            return await deleteDm3Name(setDisplayName);
        }
    };

    const deleteDm3Name = async (setDisplayName: Function) => {
        if (dm3NameServiceSelected === DM3_NAME_SERVICES.CLOUD) {
            const result = await removeAliasFromDm3Name(
                dm3Configuration.resolverBackendUrl,
                profileKeys!,
                existingDm3Name as string,
                setLoaderContent,
                setError,
            );

            if (result) {
                setExistingDm3Name(null);
                setDisplayName('');
                return {
                    error: '',
                    status: true,
                };
            } else {
                return {
                    error: 'Failed to remove DM3 name',
                    status: false,
                };
            }
        }
        if (dm3NameServiceSelected === DM3_NAME_SERVICES.OPTIMISM) {
            const chainToConnect =
                Number(dm3Configuration.chainId) ===
                supportedChains.ethereumTestnet
                    ? supportedChains.optimismTestnet
                    : supportedChains.optimismMainnet;
            return await deleteOptimismName(chainToConnect, setDisplayName);
        }
    };

    /** TODO : Check this method once smart contract is implemented */
    const deleteOptimismName = async (
        chainToConnect: number,
        setDisplayName: Function,
    ) => {
        if (chainToConnect !== chainId) {
            setError(
                'Invalid chain connected. Please switch to Optimism network.',
                NAME_TYPE.ENS_NAME,
            );
            return {
                error: 'Invalid chain connected. Please switch to Optimism network.',
                status: false,
            };
        }

        try {
            // start loader
            setLoaderContent('Removing OP name...');
            startLoader();

            const tx = await getRemoveOpProfileOnchainTransaction(
                mainnetProvider,
                account!,
                dm3Name!,
            );

            if (tx) {
                setExistingDm3Name(null);
                setDisplayName('');
                const response = await ethersHelper.executeTransaction(tx);
                await response.wait();
                /** TODO : Remove this line if not required*/
                // setEnsNameFromResolver(ensName);
            } else {
                throw Error('Error removing OP name transaction');
            }
        } catch (e: any) {
            const check = e.toString().includes('user rejected transaction');
            const errorMsg = check
                ? 'User rejected transaction'
                : 'Failed to remove OP name';
            setError(errorMsg, NAME_TYPE.DM3_NAME);
            closeLoader();
            return {
                error: errorMsg,
                status: false,
            };
        }

        // stop loader
        closeLoader();
    };

    const updateDeleteConfirmation = (action: boolean) => {
        setShowDeleteConfirmation(action);
    };

    const getChainOfDm3Name = (): number => {
        if (existingDm3Name) {
            return existingDm3Name.endsWith(
                dm3Configuration.addressEnsSubdomain,
            ) || existingDm3Name.endsWith(dm3Configuration.userEnsSubdomain)
                ? 0
                : Number(dm3Configuration.chainId) ===
                  supportedChains.ethereumTestnet
                ? supportedChains.optimismTestnet
                : supportedChains.optimismMainnet;
        }
        return 0;
    };

    // handles existing DM3 name
    useEffect(() => {
        if (account!.ensName) {
            fetchExistingDM3Name(
                dm3Configuration.resolverBackendUrl,
                mainnetProvider,
                account!,
                setExistingDm3Name,
                dm3Configuration.addressEnsSubdomain,
                dm3Configuration.userEnsSubdomain,
            );
        }
    }, [account]);

    // clears the input field on deleting the alias
    useEffect(() => {
        if (!showDeleteConfirmation) {
            setDm3Name('');
        }
    }, [showDeleteConfirmation]);

    return (
        <ConfigureDM3NameContext.Provider
            value={{
                existingDm3Name,
                setExistingDm3Name,
                dm3Name,
                setDm3Name,
                showDeleteConfirmation,
                setShowDeleteConfirmation,
                handleNameChange,
                handleClaimOrRemoveDm3Name,
                updateDeleteConfirmation,
                setError,
                getChainOfDm3Name,
            }}
        >
            {props.children}
        </ConfigureDM3NameContext.Provider>
    );
};
