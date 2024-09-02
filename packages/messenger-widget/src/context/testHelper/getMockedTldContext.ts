import { TLDContextType } from '../TLDContext';

export const getMockedTldContext = (override?: Partial<TLDContextType>) => {
    const defaultValues = {
        resolveAliasToTLD: async () => '',
        resolveTLDtoAlias: async () => '',
    };

    return { ...defaultValues, ...override };
};
