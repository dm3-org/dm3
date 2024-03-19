/* eslint-disable max-len */
import { ethers } from 'ethers';
import { useContext } from 'react';
import { useChainId } from 'wagmi';
import { AuthContext } from '../../../../context/AuthContext';
import { GlobalContext } from '../../../../utils/context-utils';
import { ConfigureProfileContext } from '../../context/ConfigureProfileContext';
import { SubmitOnChainProfile } from '../SubmitOnChainProfile';
import { IChain, NAME_TYPE, validateEnsName } from '../common';
import { submitEnsNameTransaction } from './bl';

export const ConfigureEnsProfile = (props: IChain) => {
    const { dispatch } = useContext(GlobalContext);

    const chainId = useChainId();

    const { onShowError, setExistingEnsName, setEnsName } = useContext(
        ConfigureProfileContext,
    );

    const { account, ethAddress, deliveryServiceToken } =
        useContext(AuthContext);

    const provider = new ethers.providers.Web3Provider(
        window.ethereum as ethers.providers.ExternalProvider,
    );

    const onSubmitTx = async (name: string) => {
        if (props.chainToConnect !== chainId) {
            onShowError(NAME_TYPE.ENS_NAME, 'Invalid chain connected');
            return;
        }
        await submitEnsNameTransaction(
            provider!,
            account!,
            ethAddress!,
            deliveryServiceToken!,
            dispatch,
            name,
            (str: string) => setExistingEnsName(str),
            onShowError,
        );
    };
    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        onShowError(undefined, '');
        const check = validateEnsName(e.target.value);
        setEnsName(e.target.value);
        if (!check) {
            onShowError(NAME_TYPE.ENS_NAME, 'Invalid ENS name');
        }
    };

    const label =
        'To publish your dm3 profile, a transaction is sent to set a text record in your ENS name. Transaction costs will apply for setting the profile and administration.';
    const note = 'You can receive dm3 messages directly sent to your ENS name.';
    const placeholder = 'Enter your ENS name connected to your wallet';

    return (
        <SubmitOnChainProfile
            handleNameChange={handleNameChange}
            label={label}
            note={note}
            placeholder={placeholder}
            onSubmitTx={onSubmitTx}
        />
    );
};
