import {
    createReplyMessage,
    createEditMessage,
    createMessage,
} from '@dm3-org/dm3-lib-messaging';
import { MessageActionType } from '../../utils/enum-type-utils';
import { scrollToBottomOfChat } from '../Chat/scrollToBottomOfChat';
import { MessageAction, MessageDataProps } from '../../interfaces/props';
import { Account } from '@dm3-org/dm3-lib-profile';
import { AddMessage } from '../../hooks/messages/useMessage';
import { ContactPreview } from '../../interfaces/utils';
import { closeErrorModal, openErrorModal } from '../../utils/common-utils';

export const onSubmitMessage = async (
    messageView: MessageAction,
    setMessageView: (view: MessageAction) => void,
    setLastMessageAction: (action: MessageActionType) => void,
    addMessage: AddMessage,
    props: MessageDataProps,
    profileKeys: any,
    account: Account,
    selectedContact: ContactPreview,
) => {
    if (messageView.actionType === MessageActionType.REPLY) {
        const referenceMessageHash =
            messageView.messageData?.envelop.metadata?.encryptedMessageHash;

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
        setLastMessageAction(MessageActionType.REPLY);

        // Removes preview of reply to message in the UI
        setMessageView({
            actionType: MessageActionType.NONE,
            messageData: undefined,
        });

        return;
    }
    if (messageView.actionType === MessageActionType.EDIT) {
        const referenceMessageHash =
            messageView.messageData?.envelop.metadata?.encryptedMessageHash;

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

        setMessageView({
            actionType: MessageActionType.NONE,
            messageData: undefined,
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
