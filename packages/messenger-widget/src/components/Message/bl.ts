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
} from '../../utils/enum-type-utils';
import {
    getDependencies,
    getHaltDelivery,
    sendMessage,
} from '../../utils/common-utils';

export const setFilesData = async (
    files: string[],
    setAttachmentsData: Function,
) => {
    let data: Attachment[] = [];
    let fileType;
    files.forEach((file, index) => {
        fileType = file.substring(
            file.indexOf('/') + 1,
            file.indexOf(';base64'),
        );
        data.push({
            id: Math.random().toString(36).substring(2, 12),
            name: `file${index}`.concat('.', fileType),
            data: file,
            isImage: isFileAImage(fileType),
        });
    });
    setAttachmentsData(data);
};

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
    if (!props.ownMessage) {
        const userDb = state.userDb;

        if (!userDb) {
            throw Error('userDB not found');
        }

        if (!state.accounts.selectedContact) {
            throw Error('no contact selected');
        }

        const messageHash = deleteEmojiData.metadata?.encryptedMessageHash;

        // delete the message
        const messageData = await createDeleteRequestMessage(
            state.accounts.selectedContact?.account.ensName as string,
            state.connection.account!.ensName,
            userDb.keys.signingKeyPair.privateKey as string,
            messageHash as string,
        );

        messageData.metadata.type = MessageActionType.REACT;

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
            payload: MessageActionType.DELETE,
        });
    }
};
