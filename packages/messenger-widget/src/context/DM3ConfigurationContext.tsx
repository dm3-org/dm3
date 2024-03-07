import React from 'react';
import { DM3Configuration } from '../interfaces/config';
import { useDm3Configuration } from '../hooks/configuration/useDM3Configuration';

export type DM3ConfigurationContextType = {
    setDm3Configuration: (configuration: DM3Configuration) => void;
    dm3Configuration: DM3Configuration;
};

export const DM3ConfigurationContext =
    React.createContext<DM3ConfigurationContextType>({
        setDm3Configuration: (configuration: DM3Configuration) => {},
        dm3Configuration: {
            defaultContact: '',
            defaultServiceUrl: '',
            ethereumProvider: '',
            walletConnectProjectId: '',
            userEnsSubdomain: '',
            addressEnsSubdomain: '',
            resolverBackendUrl: '',
            profileBaseUrl: '',
            defaultDeliveryService: '',
            backendUrl: '',
            chainId: '',
            resolverAddress: '',
            showAlways: true,
            showContacts: true,
        },
    });

export const DM3ConfigurationContextProvider = ({
    children,
}: {
    children?: any;
}) => {
    const { dm3Configuration, setDm3Configuration } = useDm3Configuration();

    return (
        <DM3ConfigurationContext.Provider
            value={{
                dm3Configuration,
                setDm3Configuration,
            }}
        >
            {children}
        </DM3ConfigurationContext.Provider>
    );
};
