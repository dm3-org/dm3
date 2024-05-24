import { useContext, useEffect, useState } from 'react';
import { SubmitOnChainProfile } from '../SubmitOnChainProfile';
import { submitGenomeNameTransaction, validateGenomeName } from './bl';
import { ConfigureProfileContext } from '../../context/ConfigureProfileContext';
import { useChainId, useSwitchNetwork } from 'wagmi';
import { AuthContext } from '../../../../context/AuthContext';
import { ethers } from 'ethers';
import { IChain, NAME_TYPE } from '../common';
import { ModalContext } from '../../../../context/ModalContext';
import { DM3ConfigurationContext } from '../../../../context/DM3ConfigurationContext';
import { ConfigureDM3NameContext } from '../../context/ConfigureDM3NameContext';
import { fetchChainIdFromServiceName } from '../../bl';

export const ConfigureGenomeProfile = (props: IChain) => {
    const connectedChainId = useChainId();

    const { switchNetwork } = useSwitchNetwork();

    const { setLoaderContent } = useContext(ModalContext);

    const { ethAddress, account, deliveryServiceToken } =
        useContext(AuthContext);

    const {
        onShowError,
        setExistingEnsName,
        setEnsName,
        namingServiceSelected,
    } = useContext(ConfigureProfileContext);

    const { setDm3Name } = useContext(ConfigureDM3NameContext);

    const { dm3Configuration } = useContext(DM3ConfigurationContext);

    const [gnosisName, setGnosisName] = useState<string>('');

    // changes network on GNO naming service change
    const changeNetwork = async (gnoName: string) => {
        const chainId = fetchChainIdFromServiceName(
            namingServiceSelected,
            dm3Configuration.chainId,
        );
        if (chainId && chainId !== connectedChainId && switchNetwork) {
            switchNetwork(chainId);
            setGnosisName(gnoName);
        } else {
            await registerAndPublish(gnoName);
        }
    };

    const onSubmitTx = async (gnoName: string) => {
        changeNetwork(gnoName);
    };

    const registerAndPublish = async (name: string) => {
        if (props.chainToConnect !== connectedChainId) {
            onShowError(
                NAME_TYPE.ENS_NAME,
                'Invalid chain connected. Please switch to Gnosis network.',
            );
            return;
        }
        const provider = new ethers.providers.Web3Provider(
            window.ethereum as ethers.providers.ExternalProvider,
        );
        await submitGenomeNameTransaction(
            provider,
            deliveryServiceToken!,
            account!,
            setLoaderContent,
            name,
            ethAddress!,
            dm3Configuration.genomeRegistryAddress,
            (str: string) => setExistingEnsName(str),
            onShowError,
            dm3Configuration.backendUrl,
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

    // on change of network by user, GNO name is published
    useEffect(() => {
        if (
            connectedChainId ===
                fetchChainIdFromServiceName(
                    namingServiceSelected,
                    dm3Configuration.chainId,
                ) &&
            gnosisName.length
        ) {
            registerAndPublish(gnosisName);
        }
    }, [connectedChainId]);

    // on change of dropdown selected, error vanishes
    useEffect(() => {
        onShowError(undefined, '');
        setEnsName('');
    }, [namingServiceSelected]);

    const propertyName = 'GNO Name';

    const label =
        'To publish your dm3 profile, a transaction is sent to set a text record in your GNO name.' +
        'Transaction costs will apply for setting the profile and administration.';

    const note =
        'You can receive dm3 messages directly sent to your GNO name or to the linked ENS name' +
        '(<yourname>.gnosis.eth).';

    const placeholder = 'Enter your GNO name connected to your wallet';
    return (
        <SubmitOnChainProfile
            propertyName={propertyName}
            handleNameChange={handleNameChange}
            label={label}
            note={note}
            placeholder={placeholder}
            onSubmitTx={onSubmitTx}
        />
    );
};
