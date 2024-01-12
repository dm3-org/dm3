import { ProfileKeys } from '@dm3-org/dm3-lib-profile';
import React, { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { GlobalContext } from './GlobalContext';

export type AuthContextType = {
    profileKeys: ProfileKeys;
    ensName: string;
    token: string;
    initialized: boolean;
};

export const AuthContext = React.createContext<AuthContextType>({
    profileKeys: {} as ProfileKeys,
    ensName: '',
    token: '',
    initialized: false,
});

export const AuthContextProvider = ({
    children,
}: {
    children?: React.ReactNode;
}) => {
    const { clientProps, web3Provider } = React.useContext(GlobalContext);
    const { getWallet } = useAuth(web3Provider, clientProps);

    const [initialized, setInitialized] = useState(false);

    const [profileKeys, setprofileKeys] = useState<ProfileKeys>(
        {} as ProfileKeys,
    );
    const [_ensName, setEnsName] = useState<string>('');
    const [token, setToken] = useState<string>('');

    useEffect(() => {
        const init = async () => {
            //If the user is not signed in with SIWE, we're using the view only mode
            if (
                !clientProps.siweAddress ||
                !clientProps.siweMessage ||
                !clientProps.siweSig ||
                //We want to init the AuthContext again when the user decides to changes his account.
                //We can detect that by checking wether the siweAddress alters from the previous one.
                _ensName.includes(clientProps.siweAddress)
            ) {
                return;
            }
            const { keys, ensName, token } = await getWallet();
            setprofileKeys(keys);
            setEnsName(ensName);
            setToken(token);
            setInitialized(true);
        };

        init();
    }, [
        clientProps.siweAddress,
        clientProps.siweMessage,
        clientProps.siweSig,
        getWallet,
        _ensName,
    ]);

    return (
        <AuthContext.Provider
            value={{ profileKeys, ensName: _ensName, initialized, token }}
        >
            {children}
        </AuthContext.Provider>
    );
};
