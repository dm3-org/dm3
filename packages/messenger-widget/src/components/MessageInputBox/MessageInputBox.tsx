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
import { HideFunctionProps } from '../../interfaces/props';

export function MessageInputBox(props: HideFunctionProps) {
    const [message, setMessage] = useState('');

    const { state, dispatch } = useContext(GlobalContext);
    const [filesSelected, setFilesSelected] = useState<Attachment[]>([]);

    function setFiles(files: Attachment[]) {
        setFilesSelected(files);
    }

    function setMessageText(msg: string) {
        setMessage(msg);
    }

    const setChatContainerHeight = () => {
        const element = document.getElementById('chat-msgs');
        if (element) {
            if (filesSelected.length > 0) {
                element.style.height = 'calc(100% - 102px) !important';
            } else {
                element.style.height = 'calc(100% - 65px) !important';
            }
        }
    };

    useEffect(() => {
        setChatContainerHeight();
    }, [filesSelected]);

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

    useEffect(() => {
        setFilesSelected([]);
        setChatContainerHeight();
    }, [state.accounts.selectedContact]);

    return (
        <div
            id="msg-input-box-container"
            className="mb-1 p-1 msg-input-box-container width-fill"
        >
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
                            {(!props.hideFunction ||
                                !props.hideFunction
                                    .split(',')
                                    .includes('attachments')) && (
                                <AttachmentSelector
                                    filesSelected={filesSelected}
                                    setFiles={setFiles}
                                />
                            )}

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
