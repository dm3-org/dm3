import { Envelop, MessageState } from '@dm3-org/dm3-lib-messaging';
import { MessageActionType } from '../utils/enum-type-utils';
import { Dm3Props } from './config';
import { Attachment, ContactPreview } from './utils';

export interface DashboardProps {
    dm3Props: Dm3Props;
}

export interface IEnsDetails {
    propertyKey: string;
    propertyValue: string;
    action?: Function;
}

export interface IContactMenu {
    contactDetails: ContactPreview;
    index: number;
    isMenuAlignedAtBottom: boolean;
}

export interface MessageProps {
    message: string;
    time: string;
    messageState: MessageState;
    ownMessage: boolean;
    envelop: Envelop;
    replyToMsg?: string | undefined;
    replyToMsgFrom?: string | undefined;
    replyToMsgId?: string | undefined;
    replyToMsgEnvelope?: Envelop | undefined;
    reactions: Envelop[];
    isLastMessage?: boolean;
    hideFunction?: string;
}

export interface MessageAction {
    messageData: MessageProps | undefined;
    actionType: MessageActionType;
}

export interface EmojiProps {
    message: string;
    setMessage: Function;
}

export interface ReplyMessagePreviewProps {
    setFiles: Function;
}

export interface AttachmentProps {
    filesSelected: Attachment[];
    setFiles: Function;
}

export interface MessageDataProps {
    message: string;
    filesSelected: Attachment[];
    setFiles: Function;
    setMessageText: Function;
}

export interface AttachmentPreviewProps {
    filesSelected: Attachment[];
    isMyMessage: boolean;
    isReplyMsgAttachments?: boolean;
}

export interface ImageModal {
    uri: string;
    setUri: Function;
}

export interface DeleteDM3NameProps {
    setDeleteDM3NameConfirmation: Function;
    removeDm3Name: Function;
}

export interface HideFunctionProps {
    hideFunction?: string;
    showContacts?: boolean;
    defaultContact?: string;
}
