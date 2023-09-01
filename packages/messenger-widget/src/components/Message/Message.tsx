import './Message.css';
import { useContext, useState } from 'react';
import { MessageState } from 'dm3-lib-messaging';
import tickIcon from '../../assets/images/tick.svg';
import { MessageProps } from '../../interfaces/props';
import threeDotsIcon from '../../assets/images/three-dots.svg';
import { MessageAction } from '../MessageAction/MessageAction';
import { MessageActionType } from '../../utils/enum-type-utils';
import { GlobalContext } from '../../utils/context-utils';

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
                                : 'ms-3 normal-btn-hover'
                            : 'background-config-box',
                    )}
                >
                    {props.message ? props.message : 'This message is deleted'}
                </div>
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
                {getMessageChangeText()}
                {new Date(Number(props.time)).toLocaleString()}
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
