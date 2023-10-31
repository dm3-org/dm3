import {
    createEditMessage,
    createMessage,
    createReplyMessage,
    SendDependencies,
} from 'dm3-lib-messaging';
import {
    Actions,
    GlobalState,
    MessageActionType,
    ModalStateType,
    UiViewStateType,
} from '../../utils/enum-type-utils';
import {
    getHaltDelivery,
    getDependencies,
    sendMessage,
    openErrorModal,
    closeErrorModal,
    generateRandomStringForId,
    getFileTypeFromBase64,
} from '../../utils/common-utils';
import { Attachment } from '../../interfaces/utils';
import { scrollToBottomOfChat } from '../Chat/bl';

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

const handleNewUserMessage = async (
    message: string,
    state: GlobalState,
    dispatch: React.Dispatch<Actions>,
    attachments: string[],
) => {
    const userDb = state.userDb;

    if (!userDb) {
        throw Error('userDB not found');
    }

    if (!state.accounts.selectedContact) {
        throw Error('no contact selected');
    }

    const messageData = await createMessage(
        state.accounts.selectedContact.account.ensName,
        state.connection.account!.ensName,
        message,
        userDb.keys.signingKeyPair.privateKey,
        attachments,
    );

    const haltDelivery = getHaltDelivery(state);
    const sendDependencies: SendDependencies = getDependencies(state);

    await sendMessage(
        state,
        sendDependencies,
        messageData,
        haltDelivery,
        dispatch,
    );
};

const editMessage = async (
    state: GlobalState,
    dispatch: React.Dispatch<Actions>,
    message: string,
    attachments: string[],
) => {
    const userDb = state.userDb;

    if (!userDb) {
        throw Error('userDB not found');
    }

    if (!state.accounts.selectedContact) {
        throw Error('no contact selected');
    }

    const referenceMessageHash =
        state.uiView.selectedMessageView.messageData?.envelop.metadata
            ?.encryptedMessageHash;

    dispatch({
        type: UiViewStateType.SetMessageView,
        payload: {
            actionType: MessageActionType.NONE,
            messageData: undefined,
        },
    });

    // edit the original message
    const messageData = await createEditMessage(
        state.accounts.selectedContact?.account.ensName as string,
        state.connection.account!.ensName,
        message,
        userDb.keys.signingKeyPair.privateKey as string,
        referenceMessageHash as string,
        attachments,
    );

    const haltDelivery = getHaltDelivery(state);
    const sendDependencies: SendDependencies = getDependencies(state);

    await sendMessage(
        state,
        sendDependencies,
        messageData,
        haltDelivery,
        dispatch,
    );
};

const replyMessage = async (
    state: GlobalState,
    dispatch: React.Dispatch<Actions>,
    message: string,
    attachments: string[],
) => {
    const userDb = state.userDb;

    if (!userDb) {
        throw Error('userDB not found');
    }

    if (!state.accounts.selectedContact) {
        throw Error('no contact selected');
    }

    const referenceMessageHash =
        state.uiView.selectedMessageView.messageData?.envelop.metadata
            ?.encryptedMessageHash;

    dispatch({
        type: UiViewStateType.SetMessageView,
        payload: {
            actionType: MessageActionType.NONE,
            messageData: undefined,
        },
    });

    // reply to the original message
    const messageData = await createReplyMessage(
        state.accounts.selectedContact?.account.ensName as string,
        state.connection.account!.ensName,
        message,
        userDb.keys.signingKeyPair.privateKey as string,
        referenceMessageHash as string,
        attachments,
    );

    const haltDelivery = getHaltDelivery(state);
    const sendDependencies: SendDependencies = getDependencies(state);

    await sendMessage(
        state,
        sendDependencies,
        messageData,
        haltDelivery,
        dispatch,
    );
};

export const handleSubmit = async (
    message: string,
    state: GlobalState,
    dispatch: React.Dispatch<Actions>,
    event:
        | React.FormEvent<HTMLFormElement>
        | React.MouseEvent<HTMLImageElement, MouseEvent>,
    filesSelected: Attachment[],
    setMessageText: Function,
    setFiles: Function,
) => {
    let attachments: string[] = [];

    dispatch({
        type: ModalStateType.OpenEmojiPopup,
        payload: { action: false, data: undefined },
    });

    event.preventDefault();

    // if attachments are selected then get the URI of each attachment
    if (filesSelected.length) {
        attachments = filesSelected.map(function (item) {
            return item['data'];
        });
    } else if (!message.trim().length) {
        return;
    }

    const sizeLimit = state.cache.messageSizeLimit;
    const sizeCheck = isMessageWithinSizeLimit(message, attachments, sizeLimit);

    if (!sizeCheck) {
        dispatch({
            type: UiViewStateType.SetMessageView,
            payload: {
                actionType: MessageActionType.NONE,
                messageData: undefined,
            },
        });

        openErrorModal(
            'The size of the message is larger than limit '
                .concat(sizeLimit.toString(), ' bytes. ')
                .concat('Please reduce the message size.'),
            false,
            closeErrorModal,
        );

        return;
    }

    // clear the message text & files selected from input field
    setMessageText('');
    setFiles([]);

    if (
        state.uiView.selectedMessageView.actionType === MessageActionType.EDIT
    ) {
        await editMessage(state, dispatch, message, attachments);
        dispatch({
            type: ModalStateType.LastMessageAction,
            payload: MessageActionType.EDIT,
        });
    } else if (
        state.uiView.selectedMessageView.actionType === MessageActionType.REPLY
    ) {
        await replyMessage(state, dispatch, message, attachments);
        scrollToBottomOfChat();
        dispatch({
            type: ModalStateType.LastMessageAction,
            payload: MessageActionType.REPLY,
        });
    } else {
        await handleNewUserMessage(message, state, dispatch, attachments);
        scrollToBottomOfChat();
        dispatch({
            type: ModalStateType.LastMessageAction,
            payload: MessageActionType.NEW,
        });
    }
};

const isMessageWithinSizeLimit = (
    message: string | undefined,
    attachments: string[],
    maximumSize: number,
): boolean => {
    let size = 0;
    if (message) {
        size = new Blob([message]).size;
    }
    attachments.forEach((file) => {
        size += new Blob([file]).size;
    });
    return size > maximumSize ? false : true;
};
