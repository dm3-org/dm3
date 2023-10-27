import './MessageInputBox.css';
import { useContext, useEffect, useState } from 'react';
import { GlobalContext } from '../../utils/context-utils';
import { setAttachmentsOnEditMessage } from './bl';
import {
    MessageActionType,
    UiViewStateType,
} from '../../utils/enum-type-utils';
import { EmojiModal } from '../EmojiModal/EmojiModal';
import { Attachment } from '../../interfaces/utils';
import { ReplyMessagePreview } from '../ReplyMessagePreview/ReplyMessagePreview';
import { AttachmentPreview } from '../AttachmentPreview/AttachmentPreview';
import { AttachmentSelector } from '../AttachmentSelector/AttachmentSelector';
import { EmojiSelector } from '../EmojiSelector/EmojiSelector';
import { MessageInputField } from '../MessageInputField/MessageInputField';
import { SendMessage } from '../SendMessage/SendMessage';

export function MessageInputBox() {
    const [message, setMessage] = useState('');

    const { state, dispatch } = useContext(GlobalContext);
    const [filesSelected, setFilesSelected] = useState<Attachment[]>([]);

    function setFiles(files: Attachment[]) {
        setFilesSelected(files);
    }

    function setMessageText(msg: string) {
        setMessage(msg);
    }

    useEffect(() => {
        if (
            state.uiView.selectedMessageView.actionType ===
            MessageActionType.EDIT
        ) {
            setMessage(
                state.uiView.selectedMessageView.messageData?.message as string,
            );
            setAttachmentsOnEditMessage(state, setFiles);
        }
    }, [state.uiView.selectedMessageView]);

    useEffect(() => {
        dispatch({
            type: UiViewStateType.SetMessageView,
            payload: {
                actionType: MessageActionType.NONE,
                messageData: undefined,
            },
        });
        setMessage('');
    }, [state.accounts.selectedContact]);

    return (
        <div className="mt-3">
            {/* Reply message preview */}
            {state.uiView.selectedMessageView.actionType ===
                MessageActionType.REPLY && (
                <ReplyMessagePreview setFiles={setFiles} />
            )}

            {/* Emoji popup modal */}
            {state.modal.openEmojiPopup.action && (
                <EmojiModal message={message} setMessage={setMessage} />
            )}

            {/* Message emoji, file & input window */}
            <div className="d-flex width-fill">
                <div
                    className={'chat-action-items width-fill border-radius-6'.concat(
                        ' ',
                        state.uiView.selectedMessageView.actionType ===
                            MessageActionType.REPLY
                            ? 'reply-msg-active'
                            : '',
                    )}
                >
                    {/* Attachments selected preview */}
                    {filesSelected.length > 0 && (
                        <AttachmentPreview
                            filesSelected={filesSelected}
                            setFiles={setFiles}
                        />
                    )}

                    <div className="d-flex align-items-center width-fill">
                        <div className="d-flex align-items-center text-secondary-color">
                            {/* Attachment selector modal */}
                            <AttachmentSelector
                                filesSelected={filesSelected}
                                setFiles={setFiles}
                            />

                            {/* Emoji selector modal  */}
                            <EmojiSelector />
                        </div>

                        {/* Input msg form */}
                        <MessageInputField
                            filesSelected={filesSelected}
                            message={message}
                            setFiles={setFiles}
                            setMessageText={setMessageText}
                        />

                        {/* Send button */}
                        <SendMessage
                            filesSelected={filesSelected}
                            message={message}
                            setFiles={setFiles}
                            setMessageText={setMessageText}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
