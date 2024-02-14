import {
    buildEnvelop,
    createEditMessage,
    createMessage,
    createReplyMessage,
    getEnvelopSize,
    Message,
    SendDependencies,
} from '@dm3-org/dm3-lib-messaging';
import { Account } from '@dm3-org/dm3-lib-profile';
import { Attachment } from '../../interfaces/utils';
import {
    closeErrorModal,
    generateRandomStringForId,
    getDependencies,
    getFileTypeFromBase64,
    getHaltDelivery,
    openErrorModal,
    sendMessage,
} from '../../utils/common-utils';
import {
    Actions,
    GlobalState,
    MessageActionType,
    ModalStateType,
    UiViewStateType,
} from '../../utils/enum-type-utils';
import { scrollToBottomOfChat } from '../Chat/bl';
import { encryptAsymmetric, EncryptedPayload } from '@dm3-org/dm3-lib-crypto';
import { log } from '@dm3-org/dm3-lib-shared';

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
    deliveryServiceToken: string,
    message: string,
    state: GlobalState,
    account: Account,
    dispatch: React.Dispatch<Actions>,
    attachments: string[],
    setMessageText: Function,
    setFiles: Function,
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
        account!.ensName,
        message,
        userDb.keys.signingKeyPair.privateKey,
        attachments,
    );

    const haltDelivery = getHaltDelivery(state);
    const sendDependencies: SendDependencies = getDependencies(state, account);

    const isMsgSizeInLimit = await isEnvelopSizeInLimit(
        messageData,
        encryptAsymmetric,
        sendDependencies,
        state,
    );

    if (!isMsgSizeInLimit) return;

    // clear the message text & files selected from input field
    setMessageText('');
    setFiles([]);

    scrollToBottomOfChat();

    await sendMessage(
        account,
        deliveryServiceToken!,
        state,
        sendDependencies,
        messageData,
        haltDelivery,
        dispatch,
    );
};

const editMessage = async (
    deliveryServiceToken: string,
    state: GlobalState,
    account: Account,
    dispatch: React.Dispatch<Actions>,
    message: string,
    attachments: string[],
    setMessageText: Function,
    setFiles: Function,
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

    // edit the original message
    const messageData = await createEditMessage(
        state.accounts.selectedContact?.account.ensName as string,
        account!.ensName,
        message,
        userDb.keys.signingKeyPair.privateKey as string,
        referenceMessageHash as string,
        attachments,
    );

    const haltDelivery = getHaltDelivery(state);
    const sendDependencies: SendDependencies = getDependencies(state, account);

    const isMsgSizeInLimit = await isEnvelopSizeInLimit(
        messageData,
        encryptAsymmetric,
        sendDependencies,
        state,
    );

    if (!isMsgSizeInLimit) return;

    // clear the message text & files selected from input field
    setMessageText('');
    setFiles([]);
    scrollToBottomOfChat();

    dispatch({
        type: UiViewStateType.SetMessageView,
        payload: {
            actionType: MessageActionType.NONE,
            messageData: undefined,
        },
    });

    await sendMessage(
        account,
        deliveryServiceToken!,
        state,
        sendDependencies,
        messageData,
        haltDelivery,
        dispatch,
    );
};

const replyMessage = async (
    deliveryServiceToken: string,
    state: GlobalState,
    account: Account,
    dispatch: React.Dispatch<Actions>,
    message: string,
    attachments: string[],
    setMessageText: Function,
    setFiles: Function,
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

    // reply to the original message
    const messageData = await createReplyMessage(
        state.accounts.selectedContact?.account.ensName as string,
        account!.ensName,
        message,
        userDb.keys.signingKeyPair.privateKey as string,
        referenceMessageHash as string,
        attachments,
    );

    const haltDelivery = getHaltDelivery(state);
    const sendDependencies: SendDependencies = getDependencies(state, account);

    const isMsgSizeInLimit = await isEnvelopSizeInLimit(
        messageData,
        encryptAsymmetric,
        sendDependencies,
        state,
    );

    if (!isMsgSizeInLimit) return;

    // clear the message text & files selected from input field
    setMessageText('');
    setFiles([]);
    scrollToBottomOfChat();

    dispatch({
        type: UiViewStateType.SetMessageView,
        payload: {
            actionType: MessageActionType.NONE,
            messageData: undefined,
        },
    });

    await sendMessage(
        account,
        deliveryServiceToken,
        state,
        sendDependencies,
        messageData,
        haltDelivery,
        dispatch,
    );
};

export const handleSubmit = async (
    deliveryServiceToken: string,
    message: string,
    state: GlobalState,
    account: Account,
    dispatch: React.Dispatch<Actions>,
    event:
        | React.FormEvent<HTMLFormElement>
        | React.MouseEvent<HTMLImageElement, MouseEvent>,
    filesSelected: Attachment[],
    setMessageText: Function,
    setFiles: Function,
) => {
    let attachments: string[] = [];
    console.log('handleSubmit lets goo');

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
        //Dont send empty message
    } else if (!message.trim().length) {
        return;
    }

    if (
        state.uiView.selectedMessageView.actionType === MessageActionType.EDIT
    ) {
        await editMessage(
            deliveryServiceToken,
            state,
            account,
            dispatch,
            message,
            attachments,
            setMessageText,
            setFiles,
        );
        dispatch({
            type: ModalStateType.LastMessageAction,
            payload: MessageActionType.EDIT,
        });
    } else if (
        state.uiView.selectedMessageView.actionType === MessageActionType.REPLY
    ) {
        await replyMessage(
            deliveryServiceToken,
            state,
            account,
            dispatch,
            message,
            attachments,
            setMessageText,
            setFiles,
        );
        scrollToBottomOfChat();
        dispatch({
            type: ModalStateType.LastMessageAction,
            payload: MessageActionType.REPLY,
        });
    } else {
        await handleNewUserMessage(
            deliveryServiceToken,
            message,
            state,
            account,
            dispatch,
            attachments,
            setMessageText,
            setFiles,
        );
        scrollToBottomOfChat();
        dispatch({
            type: ModalStateType.LastMessageAction,
            payload: MessageActionType.NEW,
        });
    }
};

const isEnvelopSizeInLimit = async (
    messageData: Message,
    encryptAsymmetric: (
        externalPublicKey: string,
        payload: string,
    ) => Promise<EncryptedPayload>,
    sendDependencies: SendDependencies,
    state: GlobalState,
): Promise<boolean> => {
    try {
        const { encryptedEnvelop } = await buildEnvelop(
            messageData,
            encryptAsymmetric,
            sendDependencies,
        );

        const envelopSize = getEnvelopSize(encryptedEnvelop);
        const sizeLimit = state.cache.messageSizeLimit;

        if (envelopSize > sizeLimit) {
            openErrorModal(
                'The size of the message is larger than limit '
                    .concat(sizeLimit.toString(), ' bytes. ')
                    .concat('Please reduce the message size.'),
                false,
                closeErrorModal,
            );

            return false;
        }
        return true;
    } catch (error) {
        log(error, 'message size limit');
        return true;
    }
};
