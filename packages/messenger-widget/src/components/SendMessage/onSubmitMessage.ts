import {
    createReplyMessage,
    createEditMessage,
    createMessage,
} from '@dm3-org/dm3-lib-messaging';
import {
    GlobalState,
    MessageActionType,
    ModalStateType,
    UiViewStateType,
} from '../../utils/enum-type-utils';
import { scrollToBottomOfChat } from '../Chat/scrollToBottomOfChat';
import { MessageDataProps } from '../../interfaces/props';
import { Account } from '@dm3-org/dm3-lib-profile';
import { AddMessage } from '../../hooks/messages/useMessage';
import { ContactPreview } from '../../interfaces/utils';
import { closeErrorModal, openErrorModal } from '../../utils/common-utils';

export const onSubmitMessage = async (
    state: GlobalState,
    dispatch: any,
    addMessage: AddMessage,
    props: MessageDataProps,
    profileKeys: any,
    account: Account,
    selectedContact: ContactPreview,
) => {
    if (
        state.uiView.selectedMessageView.actionType === MessageActionType.REPLY
    ) {
        const referenceMessageHash =
            state.uiView.selectedMessageView.messageData?.envelop.metadata
                ?.encryptedMessageHash;

        const messageData = await createReplyMessage(
            selectedContact?.contactDetails.account.ensName!,
            account!.ensName,
            props.message,
            profileKeys?.signingKeyPair.privateKey!,
            referenceMessageHash!,
            props.filesSelected.map((file) => file.data),
        );

        const { error } = await addMessage(
            selectedContact?.contactDetails.account.ensName!,
            messageData,
        );

        if (error) {
            openErrorModal(error, false, closeErrorModal);
            return;
        }

        props.setFiles([]);
        props.setMessageText('');

        scrollToBottomOfChat();
        dispatch({
            type: ModalStateType.LastMessageAction,
            payload: MessageActionType.REPLY,
        });

        // Removes preview of reply to message in the UI
        dispatch({
            type: UiViewStateType.SetMessageView,
            payload: {
                actionType: MessageActionType.NONE,
                messageData: undefined,
            },
        });

        return;
    }
    if (
        state.uiView.selectedMessageView.actionType === MessageActionType.EDIT
    ) {
        const referenceMessageHash =
            state.uiView.selectedMessageView.messageData?.envelop.metadata
                ?.encryptedMessageHash;

        // reply to the original message
        const messageData = await createEditMessage(
            selectedContact?.contactDetails.account.ensName!,
            account!.ensName,
            props.message,
            profileKeys!.signingKeyPair.privateKey,
            referenceMessageHash as string,
            props.filesSelected.map((file) => file.data),
        );

        const { error } = await addMessage(
            selectedContact?.contactDetails.account.ensName!,
            messageData,
        );

        if (error) {
            openErrorModal(error, false, closeErrorModal);
            return;
        }

        props.setFiles([]);
        props.setMessageText('');

        scrollToBottomOfChat();

        dispatch({
            type: UiViewStateType.SetMessageView,
            payload: {
                actionType: MessageActionType.NONE,
                messageData: undefined,
            },
        });
        return;
    }

    const messageData = await createMessage(
        selectedContact?.contactDetails.account.ensName!,
        account!.ensName,
        props.message,
        profileKeys?.signingKeyPair.privateKey!,
        props.filesSelected.map((file) => file.data),
    );

    const { error } = await addMessage(
        selectedContact?.contactDetails.account.ensName!,
        messageData,
    );

    if (error) {
        openErrorModal(error, false, closeErrorModal);
        return;
    }

    props.setFiles([]);
    props.setMessageText('');
    scrollToBottomOfChat();
};
