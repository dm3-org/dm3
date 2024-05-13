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
}

export const ConfigureDM3NameContext =
    React.createContext<ConfigureDM3NameContextType>({
        existingDm3Name: '',
        setExistingDm3Name: (name: string | null) => { },
        dm3Name: '',
        setDm3Name: (name: string) => { },
        showDeleteConfirmation: false,
        setShowDeleteConfirmation: (show: boolean) => { },
        setError: (error: string, type: NAME_TYPE | undefined) => { },
        handleNameChange: (
            e: React.ChangeEvent<HTMLInputElement>,
            type: NAME_TYPE,
        ) => { },
        handleClaimOrRemoveDm3Name: (
            type: ACTION_TYPE,
            setDisplayName: Function,
            submitDm3UsernameClaim: (dm3UserEnsName: string) => void,
        ) => { },
        updateDeleteConfirmation: (action: boolean) => { },
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

    const { setEnsName, onShowError, dm3NameServiceSelected } = useContext(ConfigureProfileContext);

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
            if (!validateName(name)) {
                setError(
                    'Invalid name, please provide a name that is at least 4 characters long',
                    NAME_TYPE.DM3_NAME,
                );
                return;
            }
            await submitDm3UsernameClaim(name);
        } else {
            await deleteDm3Name();
        }
    };

    const deleteDm3Name = async () => {
        if (dm3NameServiceSelected === DM3_NAME_SERVICES.CLOUD) {
            const result = await removeAliasFromDm3Name(
                dm3Configuration.resolverBackendUrl,
                profileKeys!,
                existingDm3Name as string,
                setLoaderContent,
                setError,
            );
            result && setExistingDm3Name(null);
            return;
        }
        if (dm3NameServiceSelected === DM3_NAME_SERVICES.OPTIMISM) {
            const chainToConnect = Number(dm3Configuration.chainId) === supportedChains.ethereumTestnet ?
                supportedChains.optimismTestnet : supportedChains.optimismMainnet;
            await deleteOptimismName(chainToConnect);
            return;
        }
    }

    const deleteOptimismName = async (chainToConnect: number) => {
        // need to show this error on other modal
        if (chainToConnect !== chainId) {
            setError(
                'Invalid chain connected. Please switch to Optimism network.',
                NAME_TYPE.ENS_NAME,
            );
            return;
        }

        try {
            // start loader
            setLoaderContent('Publishing profile...');
            startLoader();

            //     const isValid = await isEnsNameValid(
            //         mainnetProvider,
            //         ensName,
            //         ethAddress,
            //         setError,
            //     );

            //     if (!isValid) {
            //         closeLoader();
            //         return;
            //     }

            //     const tx = await getPublishProfileOnchainTransaction(
            //         mainnetProvider,
            //         account,
            //         ensName!,
            //     );

            //     if (tx) {
            //         await createAlias(
            //             account!,
            //             mainnetProvider!,
            //             account!.ensName,
            //             ensName!,
            //             dsToken,
            //         );
            //         const response = await ethersHelper.executeTransaction(tx);
            //         await response.wait();
            //         setEnsNameFromResolver(ensName);
            //     } else {
            //         throw Error('Error creating publish transaction');
            //     }
        } catch (e: any) {
            const check = e.toString().includes('user rejected transaction');
            setError(
                check
                    ? 'User rejected transaction'
                    : 'You are not the owner/manager of this name',
                NAME_TYPE.DM3_NAME,
            );
        }

        // // stop loader
        closeLoader();
    }

    const updateDeleteConfirmation = (action: boolean) => {
        setShowDeleteConfirmation(action);
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
            }}
        >
            {props.children}
        </ConfigureDM3NameContext.Provider>
    );
};
