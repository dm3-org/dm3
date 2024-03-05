import { useContext } from 'react';
import { SubmitOnChainProfile } from '../SubmitOnChainProfile';
import { submitGenomeNameTransaction, validateGenomeName } from './bl';
import { ConfigureProfileContext } from '../../context/ConfigureProfileContext';
import { GlobalContext } from '../../../../utils/context-utils';
import { useChainId } from 'wagmi';
import { AuthContext } from '../../../../context/AuthContext';
import { ethers } from 'ethers';
import { IChain, NAME_TYPE } from '../common';

export const ConfigureGenomeProfile = (props: IChain) => {
    const { state, dispatch } = useContext(GlobalContext);

    const chainId = useChainId();

    const { ethAddress, account, deliveryServiceToken } =
        useContext(AuthContext);

    const { onShowError, setExistingEnsName, setEnsName } = useContext(
        ConfigureProfileContext,
    );

    const onSubmitTx = async (name: string) => {
        if (props.chainToConnect !== chainId) {
            onShowError(NAME_TYPE.ENS_NAME, 'Invalid chain connected');
            return;
        }
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

    const label =
        'To publish your dm3 profile, a transaction is sent to set a text record in your GNO name.' +
        'Transaction costs will apply for setting the profile and administration.';

    const note =
        'You can receive dm3 messages directly sent to your GNO name or to the linked ENS name' +
        '(<yourname>.gnosis.eth).';

    const placeholder =
        'Enter your GNO name. It must be connected to your wallet';
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
