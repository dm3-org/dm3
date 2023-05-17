import { ethers } from 'ethers';
import React from 'react';
import { ContainerProps } from '../components/AutoScrollContainer';
import { BillboardWidgetProps, ClientProps, defaultClientProps } from '../types';

export type GlobalContextxtType = {
    web3Provider: ethers.providers.JsonRpcProvider;
    websocketUrl: string;
    options?: {
        className?: string;
        withToBottomButton?: boolean;
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
    websocketUrl: 'localhost:8080',
    web3Provider: window.ethereum,
    options: {
        className: 'billboard-widget',
        withToBottomButton: true,
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
