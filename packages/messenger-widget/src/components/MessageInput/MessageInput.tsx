import './MessageInput.css';
import sendBtnIcon from '../../assets/images/send-btn.svg';
import fileIcon from '../../assets/images/file.svg';
import emojiIcon from '../../assets/images/emoji.svg';
import { MessageInputProps } from '../../interfaces/props';
import { MessageState } from 'dm3-lib-messaging';
import { useState } from 'react';

export function MessageInput(props: MessageInputProps) {
    const [message, setMessage] = useState('');

    function setMessageContent(e: React.ChangeEvent<HTMLInputElement>) {
        setMessage(e.target.value);
    }

    const handleSubmit = (
        event:
            | React.FormEvent<HTMLFormElement>
            | React.MouseEvent<HTMLImageElement, MouseEvent>,
    ) => {
        event.preventDefault();
        sendMessage();
    };

    const sendMessage = () => {
        // check message validity
        if (!message.trim().length) {
            return;
        }

        props.setMessageList([
            ...props.messageList,
            // add new message
            {
                message: message,
                time: '21/09/2022, 15:09:46',
                messageState: MessageState.Read,
                ownMessage: true,
            },
            // add receivers message
            {
                message: 'Received automatically '.concat(message),
                time: '22/01/2023, 09:09:13',
                messageState: MessageState.Read,
                ownMessage: false,
            },
        ]);

        // empty input field
        setMessage('');
    };

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
                            onSubmit={(e) => handleSubmit(e)}
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
                                    e: React.MouseEvent<
                                        HTMLImageElement,
                                        MouseEvent
                                    >,
                                ) => handleSubmit(e)}
                            />
                        </span>
                    </div>
                </div>
            </div>
        </>
    );
}
