import { ethers } from 'ethers';
import React from 'react';
import { BillboardWidgetProps, ClientProps } from '../types';

export const GlobalContext = React.createContext<BillboardWidgetProps>({
    web3Provider: {} as ethers.providers.JsonRpcProvider,
    options: {
        className: 'billboard-widget',
        avatarSrc: (hash) => {
            return `https://robohash.org/${hash}?size=38x38`;
        },
        userNameResolver: undefined,
        dateFormat: 'P',
        relativeDate: true,
    },
    clientProps: {} as ClientProps,
});

export const GlobalContextProvider = (
    props: BillboardWidgetProps & { children: React.ReactNode },
) => {
    const { children, ...rest } = props;
    return (
        <GlobalContext.Provider value={{ ...rest }}>
            {children}
        </GlobalContext.Provider>
    );
};
