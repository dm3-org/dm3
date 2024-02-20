import React, { useState } from 'react';
import { NAME_TYPE } from '../chain/common';

export interface ConfigureProfileContextType {
    existingEnsName: string | null;
    setExistingEnsName: (name: string | null) => void;
    errorMsg: string;
    showError: NAME_TYPE | undefined;
    onShowError: (type: NAME_TYPE | undefined, msg: string) => void;
    ensName: string;
    setEnsName: (name: string) => void;
}

export const ConfigureProfileContext =
    React.createContext<ConfigureProfileContextType>({
        existingEnsName: '',
        setExistingEnsName: (name: string | null) => {},
        errorMsg: '',
        showError: undefined,
        onShowError: (type: NAME_TYPE | undefined, msg: string) => {},
        ensName: '',
        setEnsName: (name: string) => {},
    });

export const ConfigureProfileContextProvider = (props: { children?: any }) => {
    const [ensName, setEnsName] = useState<string>('');
    // error states
    const [showError, setShowError] = useState<NAME_TYPE | undefined>(
        undefined,
    );
    const [existingEnsName, setExistingEnsName] = useState<string | null>(null);

    const [errorMsg, setErrorMsg] = useState<string>('');
    return (
        <ConfigureProfileContext.Provider
            value={{
                existingEnsName: existingEnsName,
                setExistingEnsName,
                errorMsg: errorMsg,
                showError: showError,
                onShowError: (type: NAME_TYPE | undefined, msg: string) => {
                    setShowError(type);
                    setErrorMsg(msg);
                },
                ensName: ensName,
                setEnsName: setEnsName,
            }}
        >
            {props.children}
        </ConfigureProfileContext.Provider>
    );
};
