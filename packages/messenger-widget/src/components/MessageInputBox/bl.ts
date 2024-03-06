import { Attachment } from '../../interfaces/utils';
import {
    generateRandomStringForId,
    getFileTypeFromBase64,
} from '../../utils/common-utils';
import { GlobalState } from '../../utils/enum-type-utils';

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
    state: GlobalState,
    setFiles: Function,
) => {
    const attachments =
        state.uiView.selectedMessageView.messageData?.envelop.message
            .attachments;
    if (attachments && attachments.length) {
        const fileList: Attachment[] = [];
        let fileType;
        let id;
        for (const attachment of attachments) {
            id = generateRandomStringForId();
            fileType = getFileTypeFromBase64(attachment);
            fileList.push({
                id: id,
                name: id.substring(0, 5).concat('.', fileType),
                data: attachment,
                isImage: isFileAImage(fileType),
            });
        }
        setFiles(fileList);
    }
};
