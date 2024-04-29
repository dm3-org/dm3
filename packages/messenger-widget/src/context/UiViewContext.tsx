import React from 'react';
import { MessageAction } from '../interfaces/props';
import { useUiView } from '../hooks/uiView/useUiView';
import {
    LeftViewSelected,
    MessageActionType,
    RightViewSelected,
} from '../utils/enum-type-utils';

export type UiViewContextType = {
    selectedLeftView: LeftViewSelected;
    setSelectedLeftView: (view: LeftViewSelected) => void;
    selectedRightView: RightViewSelected;
    setSelectedRightView: (view: RightViewSelected) => void;
    messageView: MessageAction;
    setMessageView: (view: MessageAction) => void;
    resetViewStates: () => void;
};

export const UiViewContext = React.createContext<UiViewContextType>({
    selectedLeftView: LeftViewSelected.Contacts,
    setSelectedLeftView: (view: LeftViewSelected) => {},
    selectedRightView: RightViewSelected.Default,
    setSelectedRightView: (view: RightViewSelected) => {},
    messageView: {
        messageData: undefined,
        actionType: MessageActionType.NONE,
    },
    setMessageView: (view: MessageAction) => {},
    resetViewStates: () => {},
});

export const UiViewContextProvider = ({ children }: { children?: any }) => {
    const {
        selectedLeftView,
        setSelectedLeftView,
        selectedRightView,
        setSelectedRightView,
        messageView,
        setMessageView,
        resetViewStates,
    } = useUiView();

    return (
        <UiViewContext.Provider
            value={{
                selectedLeftView,
                setSelectedLeftView,
                selectedRightView,
                setSelectedRightView,
                messageView,
                setMessageView,
                resetViewStates,
            }}
        >
            {children}
        </UiViewContext.Provider>
    );
};
