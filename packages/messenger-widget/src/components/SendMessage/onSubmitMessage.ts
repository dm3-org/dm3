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

export const onSubmitMessage = async (
    state: GlobalState,
    dispatch: any,
    addMessage: AddMessage,
    props: MessageDataProps,
    profileKeys: any,
    account: Account,
    selectedContact: any,
) => {
    if (state.uiView.selectedMessageView.actionType === 'REPLY') {
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
        await addMessage(
            selectedContact?.contactDetails.account.ensName!,
            messageData,
        );

        props.setMessageText('');
        scrollToBottomOfChat();
        dispatch({
            type: ModalStateType.LastMessageAction,
            payload: MessageActionType.REPLY,
        });
        return;
    }
    if (state.uiView.selectedMessageView.actionType === 'EDIT') {
        const referenceMessageHash =
            state.uiView.selectedMessageView.messageData?.envelop.metadata
                ?.encryptedMessageHash;

        // reply to the original message
        const messageData = await createEditMessage(
            selectedContact?.account.ensName!,
            account!.ensName,
            props.message,
            profileKeys!.signingKeyPair.privateKey,
            referenceMessageHash as string,
            props.filesSelected.map((file) => file.data),
        );

        await addMessage(
            selectedContact?.contactDetails.account.ensName!,
            messageData,
        );

        props.setMessageText('');
        props.setFiles([]);
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

    addMessage(selectedContact?.contactDetails.account.ensName!, messageData);
};
