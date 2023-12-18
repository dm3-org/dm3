/* eslint-disable no-console */
import { useAccount, useWalletClient } from 'wagmi';

import { Account } from 'dm3-lib-profile';
import { UserDB } from 'dm3-lib-storage';
import { useMemo, useState } from 'react';
import { useMainnetProvider } from '../useMainnetProvider';
import { AccountConnector } from './AccountConnector';
import {
    ConnectDsResult,
    DeliveryServiceConnector,
} from './DeliveryServiceConnector';

export const useAuth = (onStorageSet: (userDb: UserDB) => void) => {
    const { data: walletClient } = useWalletClient();
    const mainnetProvider = useMainnetProvider();

    const [account, setAccount] = useState<Account | undefined>(undefined);
    const [deliveryServiceToken, setDeliveryServiceToken] = useState<
        string | undefined
    >(undefined);

    const [ethAddress, setEthAddress] = useState<string | undefined>(undefined);

    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [hasError, setHasError] = useState<boolean>(false);

    const { address } = useAccount({
        onDisconnect: () => signOut(),
    });

    const isLoggedIn = useMemo<boolean>(
        () => !!account && !!deliveryServiceToken,
        [account, deliveryServiceToken],
    );

    const signOut = () => {
        setAccount(undefined);
        setDeliveryServiceToken(undefined);
    };
    const cleanSignIn = async () => {
        setIsLoading(true);
        setHasError(false);
        //Fetch the Account either from onchain or via CCIP
        const account = await AccountConnector(mainnetProvider).connect(
            address!,
        );

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
    return {
        cleanSignIn,
        account,
        ethAddress,
        deliveryServiceToken,
        isLoggedIn,
        isLoading,
        hasError,
    };
};
