/* eslint-disable max-len */
import { MessageDataProps } from '../../interfaces/props';
import sendBtnIcon from '../../assets/images/send-btn.svg';
import { GlobalContext } from '../../utils/context-utils';
import { useContext } from 'react';
import { handleSubmit } from '../MessageInputBox/bl';
import { AuthContext } from '../../context/AuthContext';
import { StorageContext } from '../../context/StorageContext';
import {
    Message,
    createEditMessage,
    createMessage,
    createReplyMessage,
} from '@dm3-org/dm3-lib-messaging';
import { MessageContext } from '../../context/MessageContext';
import { ConversationContext } from '../../context/ConversationContext';
import { scrollToBottomOfChat } from '../Chat/bl';
import {
    MessageActionType,
    ModalStateType,
    UiViewStateType,
} from '../../utils/enum-type-utils';

export function SendMessage(props: MessageDataProps) {
    const { account, profileKeys } = useContext(AuthContext);
    const { addMessage } = useContext(MessageContext);
    const { selectedContact } = useContext(ConversationContext);
    const { state, dispatch } = useContext(GlobalContext);

    async function submit(
        event: React.MouseEvent<HTMLImageElement, MouseEvent>,
    ) {
        if (state.uiView.selectedMessageView.actionType === 'REPLY') {
            console.log('replying');
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
                state.accounts.selectedContact?.account.ensName!,
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

        addMessage(
            selectedContact?.contactDetails.account.ensName!,
            messageData,
        );

        props.setMessageText('');
        scrollToBottomOfChat();
    }

    return (
        <span className="d-flex align-items-center pointer-cursor text-secondary-color">
            <img
                className="chat-svg-icon"
                src={sendBtnIcon}
                alt="send"
                onClick={(
                    event: React.MouseEvent<HTMLImageElement, MouseEvent>,
                ) => submit(event)}
            />
        </span>
    );
}
