import { ethers } from 'ethers';
import React from 'react';
import { ContainerProps } from '../components/AutoScrollContainer';
import {
    BillboardWidgetProps,
    ClientProps,
    defaultClientProps,
} from '../types';

export type GlobalContextxtType = {
    web3Provider: ethers.providers.JsonRpcProvider;
    options?: {
        className?: string;
        avatarSrc?: string | ((hash?: string) => string);
    };
    scrollOptions?: ContainerProps;
    branding?: {
        imageSrc?: string;
        slogan?: string;
        emptyViewText?: string;
    };
    clientProps: ClientProps;
};

export const GlobalContext = React.createContext<GlobalContextxtType>({
    web3Provider: window.ethereum,
    options: {
        className: 'billboard-widget',
        avatarSrc: (hash) => {
            return `https://robohash.org/${hash}?size=38x38`;
        },
    },
    clientProps: defaultClientProps,
});

export const GlobalContextProvider = (
    props: BillboardWidgetProps & { children: any },
) => {
    const { children, ...rest } = props;
    return (
        <GlobalContext.Provider value={{ ...rest }}>
            {children}
        </GlobalContext.Provider>
    );
};
