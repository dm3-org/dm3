import {
    Account,
    ProfileKeys,
    normalizeEnsName,
} from '@dm3-org/dm3-lib-profile';
import { useContext, useEffect, useMemo, useState } from 'react';
import { useAccount, useWalletClient } from 'wagmi';
import { TLDContext } from '../../context/TLDContext';
import { useMainnetProvider } from '../mainnetprovider/useMainnetProvider';
import { AccountConnector } from './AccountConnector';
import {
    ConnectDsResult,
    DeliveryServiceConnector,
} from './DeliveryServiceConnector';
import { DM3ConfigurationContext } from '../../context/DM3ConfigurationContext';
import { UiViewContext } from '../../context/UiViewContext';
import { ModalContext } from '../../context/ModalContext';

export const useAuth = () => {
    const mainnetProvider = useMainnetProvider();

    const { resolveAliasToTLD } = useContext(TLDContext);
    const { data: walletClient } = useWalletClient();
    const { dm3Configuration } = useContext(DM3ConfigurationContext);
    const { resetViewStates } = useContext(UiViewContext);
    const { resetModalStates } = useContext(ModalContext);

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
            const displayName = await resolveAliasToTLD(account?.ensName);
            console.log('updated account', account);
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
        resetStates();
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

    const resetStates = () => {
        resetViewStates();
        resetModalStates();
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
