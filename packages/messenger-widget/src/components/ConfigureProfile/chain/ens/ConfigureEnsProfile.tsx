/* eslint-disable max-len */
import { useContext } from 'react';
import { GlobalContext } from '../../../../utils/context-utils';
import { ConfigureProfileContext } from '../../context/ConfigureProfileContext';
import { SubmitOnChainProfile } from '../SubmitOnChainProfile';
import { NAME_TYPE, validateEnsName } from '../../bl';
import { AuthContext } from '../../../../context/AuthContext';
import { submitEnsNameTransaction } from './bl';
import { useMainnetProvider } from '../../../../hooks/useMainnetProvider';

export const ConfigureEnsProfile = () => {
    const { state, dispatch } = useContext(GlobalContext);
    const { onShowError, setExistingEnsName, setEnsName } = useContext(
        ConfigureProfileContext,
    );

    const { account, ethAddress, deliveryServiceToken } =
        useContext(AuthContext);

    const mainnetProvider = useMainnetProvider();

    const onSubmitTx = async (name: string) => {
        await submitEnsNameTransaction(
            mainnetProvider!,
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
        'You can get a DM3 name for free. Please check if your desired name is available. DM3 names are created and managed on Layer2 (e.g. Optimism). Small  transaction costs will apply for setting the profile and administration.';

    return (
        <SubmitOnChainProfile
            handleNameChange={handleNameChange}
            label={label}
            onSubmitTx={onSubmitTx}
        />
    );
};
