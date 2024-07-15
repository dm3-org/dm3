import { ethers } from 'ethers';
import {
    MainnetProviderContext,
    MainnetProviderContextType,
} from '../ProviderContext';

//Provide a mocked DM3Configuration context
//Override the default values with the provided values
export const getMockedMainnetProviderContext = (
    override?: Partial<MainnetProviderContextType>,
) => {
    const defaultValues = {
        provider: {} as ethers.providers.JsonRpcProvider,
    };
    return { ...defaultValues, ...override };
};
