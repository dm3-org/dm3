import './MessageInput.css';
import sendBtnIcon from '../../assets/images/send-btn.svg';
import fileIcon from '../../assets/images/file.svg';
import emojiIcon from '../../assets/images/emoji.svg';
import { useContext, useEffect, useState } from 'react';
import { GlobalContext } from '../../utils/context-utils';
import { handleSubmit } from './bl';
import {
    MessageActionType,
    UiViewStateType,
} from '../../utils/enum-type-utils';
import closeIcon from '../../assets/images/cross.svg';
import { EmojiModal } from '../EmojiModal/EmojiModal';

export function MessageInput() {
    const [message, setMessage] = useState('');
    const [openEmojiPopup, setOpenEmojiPopup] = useState<boolean>(false);

    const { state, dispatch } = useContext(GlobalContext);

    function setMessageContent(e: React.ChangeEvent<HTMLInputElement>) {
        setOpenEmojiPopup(false);
        // if message action is edit and message length is 0, update message action
        if (!e.target.value.length) {
            dispatch({
                type: UiViewStateType.SetMessageView,
                payload: {
                    actionType: MessageActionType.NONE,
                    messageData: undefined,
                },
            });
        }
        setMessage(e.target.value);
    }

    function cancelReply() {
        dispatch({
            type: UiViewStateType.SetMessageView,
            payload: {
                messageData: undefined,
                actionType: MessageActionType.NONE,
            },
        });
    }

    useEffect(() => {
        if (
            state.uiView.selectedMessageView.actionType ===
            MessageActionType.EDIT
        ) {
            setMessage(
                state.uiView.selectedMessageView.messageData?.message as string,
            );
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
        <>
            {/* Edit message preview */}
            {state.uiView.selectedMessageView.actionType ===
                MessageActionType.REPLY && (
                <div
                    className="reply-content text-primary-color background-config-box font-size-14 
                font-weight-400 d-flex justify-content-between"
                >
                    <div className="user-name">
                        {
                            state.uiView.selectedMessageView.messageData
                                ?.envelop.message.metadata.from
                        }
                        :
                        <div className="text-primary-color">
                            {' ' +
                                state.uiView.selectedMessageView.messageData?.message
                                    .substring(0, 20)
                                    .concat('...')}
                        </div>
                    </div>
                    <img
                        className="reply-close-icon pointer-cursor"
                        src={closeIcon}
                        alt="close"
                        onClick={() => cancelReply()}
                    />
                </div>
            )}

            {/* Emoji popup modal */}
            {openEmojiPopup && (
                <EmojiModal
                    message={message}
                    setMessage={setMessage}
                    setOpenEmojiPopup={setOpenEmojiPopup}
                />
            )}

            {/* Message emoji, file & input window */}
            <div className="d-flex chat-action width-fill position-absolute">
                <div
                    className={'chat-action-items width-fill border-radius-6'.concat(
                        ' ',
                        state.uiView.selectedMessageView.actionType ===
                            MessageActionType.REPLY
                            ? 'reply-msg-active'
                            : '',
                    )}
                >
                    <div className="d-flex align-items-center width-fill">
                        <div className="d-flex align-items-center text-secondary-color">
                            <span className="d-flex">
                                <img
                                    className="chat-svg-icon"
                                    src={fileIcon}
                                    alt="file"
                                />
                            </span>
                            <span className="d-flex smile-icon">
                                <img
                                    className="chat-svg-icon pointer-cursor"
                                    src={emojiIcon}
                                    alt="emoji"
                                    onClick={() => {
                                        setOpenEmojiPopup(!openEmojiPopup);
                                    }}
                                />
                            </span>
                            <span className="d-flex smile-icon">|</span>
                        </div>
                        {/* Input msg form */}
                        <form
                            className="width-fill"
                            onSubmit={(event) =>
                                handleSubmit(
                                    message,
                                    state,
                                    dispatch,
                                    setMessage,
                                    setOpenEmojiPopup,
                                    event,
                                )
                            }
                        >
                            <input
                                id="msg-input"
                                className="text-input-field width-fill height-fill text-primary-color 
                                    font-size-14 background-chat"
                                value={message}
                                type="text"
                                autoComplete="off"
                                placeholder="Write a message..."
                                onChange={(
                                    e: React.ChangeEvent<HTMLInputElement>,
                                ) => setMessageContent(e)}
                            ></input>
                        </form>
                        {/* Send button */}
                        <span className="d-flex align-items-center pointer-cursor text-secondary-color">
                            <img
                                className="chat-svg-icon"
                                src={sendBtnIcon}
                                alt="send"
                                onClick={(
                                    event: React.MouseEvent<
                                        HTMLImageElement,
                                        MouseEvent
                                    >,
                                ) =>
                                    handleSubmit(
                                        message,
                                        state,
                                        dispatch,
                                        setMessage,
                                        setOpenEmojiPopup,
                                        event,
                                    )
                                }
                            />
                        </span>
                    </div>
                </div>
            </div>
        </>
    );
}
