import React from 'react';

import { useTopLevelAlias } from '../hooks/topLevelAlias/useTopLevelAlias';

export type TLDContextType = {
    resolveAliasToTLD: (
        ensName: string,
        foreinTldName?: string,
    ) => Promise<string>;
    resolveTLDtoAlias: (ensName: string) => Promise<string>;
};

export const TLDContext = React.createContext<TLDContextType>({
    resolveAliasToTLD: async () => '',
    resolveTLDtoAlias: async () => '',
});

export const TLDContextProvider = ({ children }: { children?: any }) => {
    const { resolveAliasToTLD, resolveTLDtoAlias } = useTopLevelAlias();

    return (
        <TLDContext.Provider
            value={{
                resolveAliasToTLD,
                resolveTLDtoAlias,
            }}
        >
            {children}
        </TLDContext.Provider>
    );
};
