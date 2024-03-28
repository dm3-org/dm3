import React from 'react';
import { DM3Configuration, Siwe } from '../interfaces/config';
import { useDm3Configuration } from '../hooks/configuration/useDM3Configuration';
import { SiweValidityStatus } from '../utils/enum-type-utils';

export type DM3ConfigurationContextType = {
    setDm3Configuration: (configuration: DM3Configuration) => void;
    dm3Configuration: DM3Configuration;
    screenWidth: number;
    setScreenWidth: (width: number) => void;
    siweValidityStatus: SiweValidityStatus;
    setSiweValidityStatus: (status: SiweValidityStatus) => void;
    validateSiweCredentials: (data: Siwe) => void;
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
        screenWidth: window.innerWidth,
        setScreenWidth: (width: number) => {},
        siweValidityStatus: SiweValidityStatus.TO_BE_INITIATED,
        setSiweValidityStatus: (status: SiweValidityStatus) => {},
        validateSiweCredentials: (data: Siwe) => {},
    });

export const DM3ConfigurationContextProvider = ({
    children,
}: {
    children?: any;
}) => {
    const {
        dm3Configuration,
        setDm3Configuration,
        screenWidth,
        setScreenWidth,
        siweValidityStatus,
        setSiweValidityStatus,
        validateSiweCredentials,
    } = useDm3Configuration();

    return (
        <DM3ConfigurationContext.Provider
            value={{
                dm3Configuration,
                setDm3Configuration,
                screenWidth,
                setScreenWidth,
                siweValidityStatus,
                setSiweValidityStatus,
                validateSiweCredentials,
            }}
        >
            {children}
        </DM3ConfigurationContext.Provider>
    );
};
