//Hook to interact with the storage.
//Will be initialized with the deliveryServiceToken and the initialUserDb after the user has logged in.

import { UserDB } from '@dm3-org/dm3-lib-storage';
import { useEffect, useMemo } from 'react';

//Handels storage sync and offers an interface for other hooks to interact with the storage
export const useStorage = (deliveryServiceToken?: string, userDb?: UserDB) => {
    const _initialized = useMemo(
        () => deliveryServiceToken && userDb,
        [deliveryServiceToken, userDb],
    );

    //Define proper sync trigger
    useEffect(() => {}, []);
};
