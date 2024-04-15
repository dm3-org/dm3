import { MessageAction, MessageProps } from '../../interfaces/props';
import { Attachment } from '../../interfaces/utils';
import {
    createNameForFile,
    generateRandomStringForId,
    getFileTypeFromBase64,
} from '../../utils/common-utils';
import { MessageActionType } from '../../utils/enum-type-utils';
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

// returns the css classes based on message type
export const getMessageStyleClasses = (
    props: MessageProps,
    messageView: MessageAction,
): string => {
    return 'width-fill text-left border-radius-6 content-style'.concat(
        ' ',
        (props.ownMessage
            ? !props.message &&
              props.envelop.message.metadata.type ===
                  MessageActionType.DELETE &&
              (!props.envelop.message.attachments ||
                  props.envelop.message.attachments.length < 1)
                ? 'own-deleted-msg'
                : messageView.actionType === MessageActionType.EDIT &&
                  messageView.messageData?.envelop.message.signature ===
                      props.envelop.message.signature
                ? 'msg-editing-active'
                : 'ms-3 own-msg-background own-msg-text'
            : !props.message &&
              props.envelop.message.metadata.type ===
                  MessageActionType.DELETE &&
              (!props.envelop.message.attachments ||
                  props.envelop.message.attachments.length < 1)
            ? 'contact-deleted-msg'
            : 'contact-msg-background contact-msg-text'
        ).concat(
            ' ',
            props.reactions.length > 0
                ? props.ownMessage
                    ? 'own-reacted-msg'
                    : 'contact-reacted-msg'
                : '',
        ),
    );
};

// returns the css classes based on the reactions
export const getMessageReactionStyleClassses = (props: MessageProps) => {
    return 'd-flex justify-content-end text-secondary-color time-style'.concat(
        ' ',
        props.reactions.length > 0
            ? !props.ownMessage
                ? 'justify-content-between'
                : 'ms-3 justify-content-end'
            : props.ownMessage
            ? 'ms-3'
            : '',
    );
};
