import {
    Account,
    ProfileKeys,
    normalizeEnsName,
} from '@dm3-org/dm3-lib-profile';
import { useContext, useEffect, useMemo, useState } from 'react';
import { useAccount, useWalletClient } from 'wagmi';
import { TLDContext } from '../../context/TLDContext';
import { GlobalContext } from '../../utils/context-utils';
import {
    Actions,
    ConnectionType,
    ModalStateType,
    UiStateType,
    UiViewStateType,
} from '../../utils/enum-type-utils';
import { useMainnetProvider } from '../mainnetprovider/useMainnetProvider';
import { AccountConnector } from './AccountConnector';
import {
    ConnectDsResult,
    DeliveryServiceConnector,
} from './DeliveryServiceConnector';
import { DM3ConfigurationContext } from '../../context/DM3ConfigurationContext';

export const useAuth = () => {
    const { resolveAliasToTLD } = useContext(TLDContext);
    const { data: walletClient } = useWalletClient();
    const mainnetProvider = useMainnetProvider();
    const { dispatch } = useContext(GlobalContext);
    const { dm3Configuration } = useContext(DM3ConfigurationContext);
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

    //The account name that should be displayed to the user. Takes alias profiles and Crosschain names into account
    const [displayName, setDisplayName] = useState<string | undefined>(
        undefined,
    );
    const [profileKeys, setProfileKeys] = useState<ProfileKeys | undefined>();

    //Effect to resolve the display name of the account currently logged in.
    //The main purpose of that function is check wether the account has been minted via an L2 name service such as
    //genome and therefore has a crosschain name that is resolved with the TopLevelAliasResolver
    useEffect(() => {
        const fetchDisplayName = async () => {
            if (!account) {
                return;
            }
            //TODO fix tommorow
            const displayName = await resolveAliasToTLD(account?.ensName);
            console.log('updated account', account);
            //const displayName = await getAlias(account.ensName);
            setDisplayName(displayName);
        };
        fetchDisplayName();
    }, [ethAddress, account]);

    // can be check to retrive the current auth state
    const isLoggedIn = useMemo<boolean>(
        () => !!account && !!deliveryServiceToken,
        [account, deliveryServiceToken],
    );

    // handles account change
    useEffect(() => {
        if (address && ethAddress && ethAddress !== address) {
            signOut();
        }
    }, [address]);

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
                dm3Configuration,
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

        const { deliveryServiceToken, signedUserProfile, profileKeys } =
            connectDsResult;

        setAccount({
            ...account,
            ensName: normalizeEnsName(account.ensName),
            profile: signedUserProfile.profile,
            profileSignature: signedUserProfile.signature,
        });

        setEthAddress(address);
        setDeliveryServiceToken(deliveryServiceToken);
        setIsLoading(false);
        setProfileKeys(profileKeys);
    };

    return {
        profileKeys,
        cleanSignIn,
        setDisplayName,
        account,
        displayName,
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
    });

    dispatch({
        type: UiStateType.Reset,
    });
    dispatch({
        type: UiViewStateType.Reset,
    });
    dispatch({
        type: ModalStateType.Reset,
    });
};
