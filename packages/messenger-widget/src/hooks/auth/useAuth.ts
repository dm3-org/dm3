/* eslint-disable no-console */
import { useAccount, useWalletClient } from 'wagmi';
import { Account } from '@dm3-org/dm3-lib-profile';
import { UserDB } from '@dm3-org/dm3-lib-storage';
import { useEffect, useMemo, useState, useContext } from 'react';
import { useMainnetProvider } from '../mainnetprovider/useMainnetProvider';
import { AccountConnector } from './AccountConnector';
import {
    ConnectDsResult,
    DeliveryServiceConnector,
} from './DeliveryServiceConnector';
import { GlobalContext } from '../../utils/context-utils';
import {
    AccountsType,
    Actions,
    CacheType,
    ConnectionType,
    ModalStateType,
    UiStateType,
    UiViewStateType,
} from '../../utils/enum-type-utils';

export const useAuth = (onStorageSet: (userDb: UserDB) => void) => {
    const { data: walletClient } = useWalletClient();
    const mainnetProvider = useMainnetProvider();
    const { dispatch } = useContext(GlobalContext);
    const { address } = useAccount({
        onDisconnect: () => signOut(),
    });

    const [account, setAccount] = useState<Account | undefined>(undefined);
    const [deliveryServiceToken, setDeliveryServiceToken] = useState<
        string | undefined
    >(undefined);

    const [ethAddress, setEthAddress] = useState<string | undefined>(undefined);

    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [hasError, setHasError] = useState<boolean>(false);

    const isLoggedIn = useMemo<boolean>(
        () => !!account && !!deliveryServiceToken,
        [account, deliveryServiceToken],
    );

    const signOut = () => {
        setAccount(undefined);
        setDeliveryServiceToken(undefined);
        resetStates(dispatch);
    };
    const cleanSignIn = async () => {
        setIsLoading(true);
        setHasError(false);
        //Fetch the Account either from onchain or via CCIP
        const account = await AccountConnector(
            walletClient!,
            mainnetProvider,
        ).connect(address!);

        if (!account) {
            throw Error('error fetching dm3Account');
        }

        let connectDsResult: ConnectDsResult | undefined;
        try {
            connectDsResult = await DeliveryServiceConnector(
                mainnetProvider,
                walletClient!,
                address!,
            ).login(account.ensName, account.userProfile);
        } catch (e) {
            setHasError(true);
            setIsLoading(false);
            setEthAddress(undefined);
            return;
        }

        const { deliveryServiceToken, userDb, signedUserProfile } =
            connectDsResult;

        onStorageSet(userDb);
        setAccount({
            ...account,
            profile: signedUserProfile.profile,
            profileSignature: signedUserProfile.signature,
        });

        setEthAddress(address);
        setDeliveryServiceToken(deliveryServiceToken);
        setIsLoading(false);
    };

    // handles account change
    useEffect(() => {
        if (address && ethAddress && ethAddress !== address) {
            signOut();
        }
    }, [address]);

    return {
        cleanSignIn,
        account,
        ethAddress,
        deliveryServiceToken,
        isLoggedIn,
        isLoading,
        hasError,
        setAccount,
    };
};

const resetStates = (dispatch: React.Dispatch<Actions>) => {
    dispatch({
        type: ConnectionType.Reset,
        payload: undefined,
    });
    dispatch({
        type: AccountsType.Reset,
        payload: undefined,
    });
    dispatch({
        type: CacheType.Reset,
        payload: undefined,
    });
    dispatch({
        type: UiStateType.Reset,
        payload: undefined,
    });
    dispatch({
        type: UiViewStateType.Reset,
        payload: undefined,
    });
    dispatch({
        type: ModalStateType.Reset,
        payload: undefined,
    });
};
