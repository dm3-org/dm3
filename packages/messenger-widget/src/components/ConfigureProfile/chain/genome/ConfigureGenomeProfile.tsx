import { useContext } from 'react';
import { SubmitOnChainProfile } from '../SubmitOnChainProfile';
import {
    isGenomeNameValid,
    submitGenomeNameTransaction,
    validateGenomeName,
} from './bl';
import { ConfigureProfileContext } from '../../context/ConfigureProfileContext';
import { NAME_TYPE } from '../../bl';
import { GlobalContext } from '../../../../utils/context-utils';
import { useAccount } from 'wagmi';
import { useAuth } from '../../../../hooks/auth/useAuth';
import { AuthContext } from '../../../../context/AuthContext';
import { ethers } from 'ethers';

export const ConfigureGenomeProfile = () => {
    const { state, dispatch } = useContext(GlobalContext);

    const { ethAddress, account, deliveryServiceToken } =
        useContext(AuthContext);

    const { onShowError, setExistingEnsName, setEnsName } = useContext(
        ConfigureProfileContext,
    );

    const onSubmitTx = async (name: string) => {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        submitGenomeNameTransaction(
            provider,
            deliveryServiceToken!,
            account!,
            dispatch,
            name,
            ethAddress!,
            (str: string) => setExistingEnsName(str),
            onShowError,
        );
    };

    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        onShowError(undefined, '');
        const check = validateGenomeName(e.target.value);
        setEnsName(e.target.value);
        if (!check) {
            onShowError(NAME_TYPE.ENS_NAME, 'Invalid GNO name');
        }
    };

    const label = 'gNosis ';
    return (
        <SubmitOnChainProfile
            handleNameChange={handleNameChange}
            label={label}
            onSubmitTx={onSubmitTx}
        />
    );
};