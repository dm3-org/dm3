import { MessageAction } from '../../interfaces/props';
import { IAttachmentPreview } from '../../interfaces/utils';
import {
    generateRandomStringForId,
    getFileTypeFromBase64,
} from '../../utils/common-utils';

export const hideMsgActionDropdown = () => {
    const element = document.getElementById('msg-dropdown') as HTMLElement;
    element && (element.style.display = 'none');
};

export const isFileAImage = (type: string): boolean => {
    if (type.toLowerCase() === 'jpg') {
        return true;
    } else if (type.toLowerCase() === 'jpeg') {
        return true;
    } else if (type.toLowerCase() === 'png') {
        return true;
    } else if (type.toLowerCase() === 'svg') {
        return true;
    } else {
        return false;
    }
};

export const setAttachmentsOnEditMessage = (
    messageView: MessageAction,
    setFiles: Function,
) => {
    const attachments = messageView.messageData?.envelop.message.attachments;
    if (attachments && attachments.length) {
        const fileList: IAttachmentPreview[] = [];
        let fileType;
        let id;
        for (const attachment of attachments) {
            id = generateRandomStringForId();
            fileType = getFileTypeFromBase64(attachment.data);
            fileList.push({
                id: id,
                name:
                    attachment.name ?? id.substring(0, 5).concat('.', fileType),
                data: attachment.data,
                isImage: isFileAImage(fileType),
            });
        }
        setFiles(fileList);
    }
};
