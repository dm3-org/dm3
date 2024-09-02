import React from 'react';
import {
    INodeDetails,
    useDm3UserProfile,
} from '../hooks/userProfile/useDm3UserProfile';

export type DM3UserProfileContextType = {
    initialize: () => void;
    updateProfileForAddressName: () => void;
    updateProfileWithTransaction: (existingName: string) => void;
    addNode: () => void;
    deleteNode: (id: number) => void;
    nodes: INodeDetails;
    isModalOpenToAddNode: boolean;
    setIsModalOpenToAddNode: (action: boolean) => void;
    error: string | null;
    setError: (msg: string) => void;
    nodeName: string;
    handleNodeNameChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    isProfileUpdated: () => boolean;
    isProfileUpdatedForAddrName: () => boolean;
    isProfileUpdatedForDm3Name: () => boolean;
    isProfileUpdatedForEnsName: () => boolean;
};

export const DM3UserProfileContext =
    React.createContext<DM3UserProfileContextType>({
        initialize: () => {},
        updateProfileForAddressName: () => {},
        updateProfileWithTransaction: (existingName: string) => {},
        addNode: () => {},
        deleteNode: (id: number) => {},
        nodes: {
            dsNames: [''],
        },
        isModalOpenToAddNode: false,
        setIsModalOpenToAddNode: (action: boolean) => {},
        error: null,
        setError: (msg: string) => {},
        nodeName: '',
        handleNodeNameChange: (e: React.ChangeEvent<HTMLInputElement>) => {},
        isProfileUpdated: () => true,
        isProfileUpdatedForAddrName: () => true,
        isProfileUpdatedForDm3Name: () => true,
        isProfileUpdatedForEnsName: () => true,
    });

export const DM3UserProfileContextProvider = ({
    children,
}: {
    children?: any;
}) => {
    const {
        initialize,
        addNode,
        updateProfileForAddressName,
        updateProfileWithTransaction,
        deleteNode,
        nodes,
        isModalOpenToAddNode,
        setIsModalOpenToAddNode,
        error,
        setError,
        nodeName,
        handleNodeNameChange,
        isProfileUpdated,
        isProfileUpdatedForAddrName,
        isProfileUpdatedForDm3Name,
        isProfileUpdatedForEnsName,
    } = useDm3UserProfile();

    return (
        <DM3UserProfileContext.Provider
            value={{
                initialize,
                addNode,
                updateProfileForAddressName,
                updateProfileWithTransaction,
                deleteNode,
                nodes,
                isModalOpenToAddNode,
                setIsModalOpenToAddNode,
                error,
                setError,
                nodeName,
                handleNodeNameChange,
                isProfileUpdated,
                isProfileUpdatedForAddrName,
                isProfileUpdatedForDm3Name,
                isProfileUpdatedForEnsName,
            }}
        >
            {children}
        </DM3UserProfileContext.Provider>
    );
};
