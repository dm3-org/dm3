import { useContext } from 'react';
import { GlobalContext } from '../../../utils/context-utils';
import { submitEnsNameTransaction } from '../bl';
import { ConfigureProfileContext } from '../context/ConfigureProfileContext';
import { SubmitOnChainProfile } from './SubmitOnChainProfile';
import { AuthContext } from '../../../context/AuthContext';

export const ConfigureEnsProfile = () => {
    const { state, dispatch } = useContext(GlobalContext);
    const { account, ethAddress, deliveryServiceToken } =
        useContext(AuthContext);
    const { onShowError, setExistingEnsName } = useContext(
        ConfigureProfileContext,
    );

    const onSubmitTx = async (name: string) => {
        await submitEnsNameTransaction(
            state,
            account!,
            ethAddress!,
            deliveryServiceToken!,
            dispatch,
            name,
            (str: string) => setExistingEnsName(str),
            onShowError,
        );
    };

    return <SubmitOnChainProfile onSubmitTx={onSubmitTx} />;
};
