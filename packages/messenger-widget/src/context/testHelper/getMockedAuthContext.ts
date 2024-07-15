import { AuthContextType } from '../AuthContext';

//Provide a mocked Auth context
//Override the default values with the provided values
export const getMockedAuthContext = (override?: Partial<AuthContextType>) => {
    const defaultValues = {
        cleanSignIn: function (): Promise<void> {
            throw new Error('Function not implemented.');
        },
        siweSignIn: function (): Promise<void> {
            throw new Error('Function not implemented.');
        },
        setDisplayName: () => {},
        account: undefined,
        displayName: undefined,
        isProfileReady: false,
        isLoading: false,
        hasError: false,
        ethAddress: undefined,
        profileKeys: undefined,
    };

    return { ...defaultValues, ...override };
};
