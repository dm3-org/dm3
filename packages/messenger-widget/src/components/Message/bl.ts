import {
    Envelop,
    SendDependencies,
    createDeleteRequestMessage,
} from '@dm3-org/dm3-lib-messaging';
import { MessageProps } from '../../interfaces/props';
import { Attachment, ContactPreview } from '../../interfaces/utils';
import { isFileAImage } from '../MessageInputBox/bl';
import {
    Actions,
    GlobalState,
    MessageActionType,
    ModalStateType,
    UiViewStateType,
} from '../../utils/enum-type-utils';
import {
    createNameForFile,
    generateRandomStringForId,
    getDependencies,
    getFileTypeFromBase64,
    getHaltDelivery,
    sendMessage,
} from '../../utils/common-utils';
import { AuthContext } from '../../context/AuthContext';
import { useContext } from 'react';
import { Account, ProfileKeys } from '@dm3-org/dm3-lib-profile';

export const scrollToMessage = (replyFromMessageId: string) => {
    const element = document.getElementById(replyFromMessageId) as HTMLElement;
    element && element.scrollIntoView();
};

export const getMessageChangeText = (props: MessageProps): string => {
    switch (props.envelop.message.metadata.type) {
        case 'EDIT':
            return '(edited) ';
        case 'DELETE_REQUEST':
            return '(deleted) ';
        default:
            return '';
    }
};

export const getFilesData = (files: string[]) => {
    const data: Attachment[] = [];
    let fileType;
    files.forEach((file, index) => {
        fileType = getFileTypeFromBase64(file);
        data.push({
            id: generateRandomStringForId(),
            name: createNameForFile(index, fileType),
            data: file,
            isImage: isFileAImage(fileType),
        });
    });
    return data;
};
