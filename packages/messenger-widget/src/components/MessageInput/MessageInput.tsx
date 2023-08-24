import './MessageInput.css';
import sendBtnIcon from '../../assets/images/send-btn.svg';
import fileIcon from '../../assets/images/file.svg';
import emojiIcon from '../../assets/images/emoji.svg';
import { useContext, useState } from 'react';
import { GlobalContext } from '../../utils/context-utils';
import { handleSubmit } from './bl';

export function MessageInput() {
    const [message, setMessage] = useState('');

    const { state, dispatch } = useContext(GlobalContext);

    function setMessageContent(e: React.ChangeEvent<HTMLInputElement>) {
        setMessage(e.target.value);
    }

    return (
        <>
            {/* Message emoji, file & input window */}
            <div className="d-flex chat-action width-fill position-absolute">
                <div className="chat-action-items width-fill border-radius-6">
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
                                    className="chat-svg-icon"
                                    src={emojiIcon}
                                    alt="emoji"
                                />
                            </span>
                            <span className="d-flex smile-icon">|</span>
                        </div>
                        <form
                            className="width-fill"
                            onSubmit={(event) =>
                                handleSubmit(
                                    message,
                                    state,
                                    dispatch,
                                    setMessage,
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
