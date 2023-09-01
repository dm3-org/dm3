import './Message.css';
import { useContext, useState } from 'react';
import { MessageState } from 'dm3-lib-messaging';
import tickIcon from '../../assets/images/tick.svg';
import { MessageProps } from '../../interfaces/props';
import threeDotsIcon from '../../assets/images/three-dots.svg';
import { MessageAction } from '../MessageAction/MessageAction';
import { GlobalContext } from '../../utils/context-utils';
import { MessageActionType } from '../../utils/enum-type-utils';
import DeleteMessage from '../DeleteMessage/DeleteMessage';

export function Message(props: MessageProps) {
    const { state } = useContext(GlobalContext);

    // state to show action items three dots
    const [isHovered, setIsHovered] = useState(false);

    const handleMouseOver = () => {
        setIsHovered(true);
    };

    const handleMouseOut = () => {
        setIsHovered(false);
    };

    const getMessageChangeText = (): string => {
        switch (props.envelop.message.metadata.type) {
            case 'EDIT':
                return '(edited) ';
            case 'DELETE_REQUEST':
                return '(deleted) ';
            default:
                return '';
        }
    };

    return (
        <span
            className={'text-primary-color d-grid msg'.concat(
                ' ',
                props.ownMessage
                    ? 'me-2 justify-content-end'
                    : 'ms-2 justify-content-start',
            )}
        >
            {/* delete message popup */}
            {state.uiView.selectedMessageView.actionType ===
                MessageActionType.DELETE && <DeleteMessage />}

            <div className="d-flex">
                <div
                    className={'width-fill text-left font-size-14 border-radius-6 content-style'.concat(
                        ' ',
                        props.ownMessage
                            ? state.uiView.selectedMessageView.actionType ===
                                MessageActionType.EDIT &&
                                state.uiView.selectedMessageView.messageData
                                    ?.envelop.id === props.envelop.id
                                ? 'msg-editing-active'
                                : 'ms-3 background-config-box'
                            : 'normal-btn-hover',
                    )}
                >
                    {/* show the preview of reply message */}
                    {props.replyToMsg &&
                        props.replyToMsgFrom &&
                        props.envelop.message.metadata.type ===
                        MessageActionType.REPLY && (
                            <div className="reply-preview d-flex border-radius-4 normal-btn-inactive ">
                                <div className="user-name">
                                    {props.replyToMsgFrom.concat(': ')}
                                </div>
                                {props.replyToMsg
                                    .substring(0, 20)
                                    .concat('...')}
                            </div>
                        )}
                    {/* actual message */}
                    {props.message ? props.message : 'This message was deleted'}
                </div>
                {/* action item */}
                <div
                    className={'msg-action-container d-flex pointer-cursor border-radius-3 position-relative'.concat(
                        ' ',
                        !props.message ? 'hide-action' : '',
                    )}
                    onMouseOver={handleMouseOver}
                    onMouseLeave={handleMouseOut}
                >
                    <img
                        className="msg-action-dot"
                        src={threeDotsIcon}
                        alt="action"
                    />
                    {isHovered && <MessageAction {...props} />}
                </div>
            </div>
            <div
                className={'d-flex justify-content-end text-secondary-color time-style'.concat(
                    ' ',
                    props.ownMessage ? 'ms-3' : '',
                )}
            >
                {/* message date */}
                {getMessageChangeText()}
                {new Date(Number(props.time)).toLocaleString()}

                {/* readed message tick indicator */}
                <span className="tick-icon readed-tick-icon">
                    {!props.ownMessage ? (
                        <img src={tickIcon} alt="read" />
                    ) : props.messageState === MessageState.Read ? (
                        <>
                            <img src={tickIcon} alt="read" />
                            <img
                                src={tickIcon}
                                alt="read"
                                className="second-tick"
                            />
                        </>
                    ) : (
                        <img src={tickIcon} alt="read" />
                    )}
                </span>
            </div>
        </span>
    );
}
