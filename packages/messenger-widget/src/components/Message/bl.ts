import { MessageProps } from '../../interfaces/props';
import { Attachment } from '../../interfaces/utils';
import {
    createNameForFile,
    generateRandomStringForId,
    getFileTypeFromBase64,
} from '../../utils/common-utils';
import { isFileAImage } from '../MessageInputBox/bl';

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
