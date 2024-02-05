/* eslint-disable max-len */
import { MessageDataProps } from '../../interfaces/props';
import sendBtnIcon from '../../assets/images/send-btn.svg';
import { GlobalContext } from '../../utils/context-utils';
import { useContext } from 'react';
import { handleSubmit } from '../MessageInputBox/bl';
import { AuthContext } from '../../context/AuthContext';
import { StorageContext } from '../../context/StorageContext';
import { Message, createMessage } from '@dm3-org/dm3-lib-messaging';
import { MessageContext } from '../../context/MessageContext';
import { ConversationContext } from '../../context/ConversationContext';
import { scrollToBottomOfChat } from '../Chat/bl';

export function SendMessage(props: MessageDataProps) {
    const { account, profileKeys } = useContext(AuthContext);
    const { addMessage } = useContext(MessageContext);
    const { selectedContact } = useContext(ConversationContext);

    async function submit(
        event: React.MouseEvent<HTMLImageElement, MouseEvent>,
    ) {
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
