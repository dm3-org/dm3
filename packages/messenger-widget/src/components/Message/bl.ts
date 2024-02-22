import {
    Envelop,
    SendDependencies,
    createDeleteRequestMessage,
} from '@dm3-org/dm3-lib-messaging';
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
import { AuthContext } from '../../context/AuthContext';
import { useContext } from 'react';
import { Account } from '@dm3-org/dm3-lib-profile';

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
    account: Account,
    deliveryServiceToken: string,
    deleteEmojiData: Envelop,
    props: MessageProps,
    state: GlobalState,
    dispatch: React.Dispatch<Actions>,
) => {
    const userDb = state.userDb;

    /**
     * User can't remove reactions on his own messages.
     * As the other account can only react to my messages.
     * And only that other account can remove those reactions.
     **/
    if (props.ownMessage) {
        return;
    }

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
        account!.ensName,
        userDb.keys.signingKeyPair.privateKey as string,
        messageHash as string,
    );

    messageData.metadata.type = MessageActionType.REACT;
    messageData.message = undefined;

    const haltDelivery = getHaltDelivery(state);
    const sendDependencies: SendDependencies = getDependencies(state, account!);

    await sendMessage(
        account,
        deliveryServiceToken!,
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
