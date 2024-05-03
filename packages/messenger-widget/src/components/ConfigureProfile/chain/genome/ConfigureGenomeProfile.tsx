import { useContext } from 'react';
import { SubmitOnChainProfile } from '../SubmitOnChainProfile';
import { submitGenomeNameTransaction, validateGenomeName } from './bl';
import { ConfigureProfileContext } from '../../context/ConfigureProfileContext';
import { useChainId } from 'wagmi';
import { AuthContext } from '../../../../context/AuthContext';
import { ethers } from 'ethers';
import { IChain, NAME_TYPE } from '../common';
import { ModalContext } from '../../../../context/ModalContext';
import { DM3ConfigurationContext } from '../../../../context/DM3ConfigurationContext';
import { ConfigureDM3NameContext } from '../../context/ConfigureDM3NameContext';

export const ConfigureGenomeProfile = (props: IChain) => {
    const chainId = useChainId();

    const { setLoaderContent } = useContext(ModalContext);

    const { ethAddress, account, deliveryServiceToken } =
        useContext(AuthContext);

    const { onShowError, setExistingEnsName, setEnsName } = useContext(
        ConfigureProfileContext,
    );

    const { setDm3Name } = useContext(ConfigureDM3NameContext);

    const { dm3Configuration } = useContext(DM3ConfigurationContext);

    const onSubmitTx = async (name: string) => {
        if (props.chainToConnect !== chainId) {
            onShowError(NAME_TYPE.ENS_NAME, 'Invalid chain connected');
            return;
        }
        const provider = new ethers.providers.Web3Provider(
            window.ethereum as ethers.providers.ExternalProvider,
        );
        submitGenomeNameTransaction(
            provider,
            deliveryServiceToken!,
            account!,
            setLoaderContent,
            name,
            ethAddress!,
            dm3Configuration.genomeRegistryAddress,
            (str: string) => setExistingEnsName(str),
            onShowError,
        );
    };

    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        onShowError(undefined, '');
        setDm3Name('');
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

    const placeholder = 'Enter your GNO name connected to your wallet';
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
