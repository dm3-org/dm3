/* eslint-disable no-console */
import { useAccount, useWalletClient } from 'wagmi';

import { Account } from 'dm3-lib-profile';
import { UserDB } from 'dm3-lib-storage';
import { useMemo, useState } from 'react';
import { useMainnetProvider } from '../useMainnetProvider';
import { AccountConnector } from './AccountConnector';
import { DeliveryServiceConnector } from './DeliveryServiceConnector';

export const useAuth = (onStorageSet: (userDb: UserDB) => void) => {
    const [account, setAccount] = useState<Account | undefined>(undefined);
    const [deliveryServiceToken, setDeliveryServiceToken] = useState<
        string | undefined
    >(undefined);

    const { address } = useAccount();
    const { data: walletClient } = useWalletClient();

    const mainnetProvider = useMainnetProvider();

    const isLoggedIn = useMemo<boolean>(() => {
        console.log('call memo ', !!account && !!deliveryServiceToken);
        return !!account && !!deliveryServiceToken;
    }, [account, deliveryServiceToken]);

    const cleanSignIn = async () => {
        //Fetch the Account either from onchain or via CCIP
        const account = await AccountConnector(mainnetProvider).connect(
            address!,
        );

        if (!account) {
            throw Error('error fetching dm3Account');
        }

        const { deliveryServiceToken, userDb, signedUserProfile } =
            await DeliveryServiceConnector(
                mainnetProvider,
                walletClient!,
                address!,
            ).login(account.ensName, account.userProfile);

        onStorageSet(userDb);
        setAccount({
            ...account,
            profile: signedUserProfile.profile,
            profileSignature: signedUserProfile.signature,
        });

        setDeliveryServiceToken(deliveryServiceToken);

        console.log('deliveryServiceToken', deliveryServiceToken, account);
        console.log('isLoggedIN', isLoggedIn);
    };
    return {
        cleanSignIn,
        account,
        deliveryServiceToken,
        isLoggedIn,
    };
};
