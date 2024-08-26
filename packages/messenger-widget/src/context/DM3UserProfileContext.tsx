import React from 'react';
import {
    INodeDetails,
    useDm3UserProfile,
} from '../hooks/userProfile/useDm3UserProfile';

export type DM3UserProfileContextType = {
    initialize: () => void;
    updateProfileWithTransaction: (existingName: string) => void;
    addNode: () => void;
    deleteNode: (id: number) => void;
    changeOrder: (index: number) => void;
    nodes: INodeDetails[];
    isModalOpenToAddNode: boolean;
    setIsModalOpenToAddNode: (action: boolean) => void;
    error: string | null;
    setError: (msg: string) => void;
    nodeName: string;
    handleNodeNameChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    isDm3NameConfigured: boolean;
    isEnsNameConfigured: boolean;
};

export const DM3UserProfileContext =
    React.createContext<DM3UserProfileContextType>({
        initialize: () => {},
        updateProfileWithTransaction: (existingName: string) => {},
        addNode: () => {},
        deleteNode: (id: number) => {},
        changeOrder: (index: number) => {},
        nodes: [],
        isModalOpenToAddNode: false,
        setIsModalOpenToAddNode: (action: boolean) => {},
        error: null,
        setError: (msg: string) => {},
        nodeName: '',
        handleNodeNameChange: (e: React.ChangeEvent<HTMLInputElement>) => {},
        isDm3NameConfigured: false,
        isEnsNameConfigured: false,
    });

export const DM3UserProfileContextProvider = ({
    children,
}: {
    children?: any;
}) => {
    const {
        initialize,
        addNode,
        updateProfileWithTransaction,
        deleteNode,
        changeOrder,
        nodes,
        isModalOpenToAddNode,
        setIsModalOpenToAddNode,
        error,
        setError,
        nodeName,
        handleNodeNameChange,
        isDm3NameConfigured,
        isEnsNameConfigured,
    } = useDm3UserProfile();

    return (
        <DM3UserProfileContext.Provider
            value={{
                initialize,
                addNode,
                updateProfileWithTransaction,
                deleteNode,
                changeOrder,
                nodes,
                isModalOpenToAddNode,
                setIsModalOpenToAddNode,
                error,
                setError,
                nodeName,
                handleNodeNameChange,
                isDm3NameConfigured,
                isEnsNameConfigured,
            }}
        >
            {children}
        </DM3UserProfileContext.Provider>
    );
};
