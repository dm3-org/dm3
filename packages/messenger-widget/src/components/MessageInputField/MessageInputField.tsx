import { useContext, useEffect } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { ConversationContext } from '../../context/ConversationContext';
import { MessageContext } from '../../context/MessageContext';
import { MessageDataProps } from '../../interfaces/props';
import { MessageActionType } from '../../utils/enum-type-utils';
import { onSubmitMessage } from '../SendMessage/onSubmitMessage';
import { UiViewContext } from '../../context/UiViewContext';
import { ModalContext } from '../../context/ModalContext';

export function MessageInputField(props: MessageDataProps) {
    const { account, profileKeys } = useContext(AuthContext);
    const { selectedContact } = useContext(ConversationContext);
    const { addMessage } = useContext(MessageContext);
    const { setMessageView, messageView } = useContext(UiViewContext);
    const { setLastMessageAction } = useContext(ModalContext);

    const resetMessageView = {
        actionType: MessageActionType.NONE,
        messageData: undefined,
    };

    function setMessageContent(e: string) {
        // if message action is edit and message length is 0, update message action
        if (!e.length) {
            setMessageView(resetMessageView);
            props.setFiles([]);
        }
        props.setMessageText(e);
    }

    async function submit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        await onSubmitMessage(
            messageView,
            setMessageView,
            setLastMessageAction,
            addMessage,
            props,
            profileKeys,
            account!,
            selectedContact!,
        );
    }

    // Focus on input field when user selects a msg to EEDIT or REPLY
    useEffect(() => {
        if (
            messageView.actionType === MessageActionType.EDIT ||
            messageView.actionType === MessageActionType.REPLY
        ) {
            const inputField = document.getElementById(
                'msg-input',
            ) as HTMLElement;
            if (inputField) {
                inputField.focus();
            }
        }
    }, [messageView.actionType]);

    // Closes EDIT MSG if ESC button is clicked
    document.body.addEventListener('keydown', function (e) {
        if (
            e.key === 'Escape' &&
            messageView.actionType === MessageActionType.EDIT
        ) {
            setMessageView(resetMessageView);
            props.setFiles([]);
            props.setMessageText('');
        }
    });

    return (
        <form
            className="width-fill ms-2 d-flex"
            onSubmit={(event: React.FormEvent<HTMLFormElement>) =>
                submit(event)
            }
        >
            <textarea
                data-testid="msg-input"
                id="msg-input"
                className="text-input-field width-fill height-fill font-size-14"
                value={props.message}
                autoComplete="off"
                placeholder="Write a message..."
                onChange={(e) => setMessageContent(e.target.value)}
            ></textarea>
        </form>
    );
}
