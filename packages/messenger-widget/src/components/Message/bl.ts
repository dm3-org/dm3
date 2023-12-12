import {
    Envelop,
    SendDependencies,
    createDeleteRequestMessage,
} from 'dm3-lib-messaging';
import { MessageProps } from '../../interfaces/props';
import { Attachment } from '../../interfaces/utils';
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

export const deleteEmoji = async (
    deleteEmojiData: Envelop,
    props: MessageProps,
    state: GlobalState,
    dispatch: React.Dispatch<Actions>,
) => {
    const userDb = state.userDb;

    if (!userDb) {
        throw Error('userDB not found');
    }

    if (!state.accounts.selectedContact) {
        throw Error('no contact selected');
    }

    const messageHash = deleteEmojiData.metadata?.encryptedMessageHash;

    dispatch({
        type: UiViewStateType.SetMessageView,
        payload: {
            actionType: MessageActionType.NONE,
            messageData: undefined,
        },
    });

    // delete the message
    const messageData = await createDeleteRequestMessage(
        state.accounts.selectedContact?.account.ensName as string,
        state.connection.account!.ensName,
        userDb.keys.signingKeyPair.privateKey as string,
        messageHash as string,
    );

    messageData.metadata.type = MessageActionType.REACT;
    messageData.message = undefined;

    const haltDelivery = getHaltDelivery(state);
    const sendDependencies: SendDependencies = getDependencies(state);

    await sendMessage(
        state,
        sendDependencies,
        messageData,
        haltDelivery,
        dispatch,
    );

    dispatch({
        type: ModalStateType.LastMessageAction,
        payload: MessageActionType.NONE,
    });
};

export const getFilesData = (files: string[]) => {
    let data: Attachment[] = [];
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
