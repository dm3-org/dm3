import { useState } from 'react';
import { MessageAction } from '../../interfaces/props';
import {
    LeftViewSelected,
    MessageActionType,
    RightViewSelected,
} from '../../utils/enum-type-utils';

export const useUiView = () => {
    const defaultMessageView = {
        messageData: undefined,
        actionType: MessageActionType.NONE,
    };

    const [selectedLeftView, setSelectedLeftView] = useState<LeftViewSelected>(
        LeftViewSelected.Contacts,
    );

    const [selectedRightView, setSelectedRightView] =
        useState<RightViewSelected>(RightViewSelected.Default);

    const [messageView, setMessageView] =
        useState<MessageAction>(defaultMessageView);

    const resetViewStates = () => {
        setSelectedLeftView(LeftViewSelected.Contacts);
        setSelectedRightView(RightViewSelected.Default);
        setMessageView(defaultMessageView);
    };

    return {
        selectedLeftView,
        setSelectedLeftView,
        selectedRightView,
        setSelectedRightView,
        messageView,
        setMessageView,
        resetViewStates,
    };
};
