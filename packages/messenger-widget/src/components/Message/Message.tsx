import './Message.css';
import { MessageProps } from '../../interfaces/props';
import tickIcon from '../../assets/images/tick.svg';
import { MessageState } from 'dm3-lib-messaging';

export function Message(props: MessageProps) {
    return (
        <span
            className={'text-primary-color d-grid'.concat(
                ' ',
                props.ownMessage
                    ? 'me-3 justify-content-end'
                    : 'ms-3 justify-content-start',
            )}
        >
            <div className="d-flex">
                <div
                    className={'width-fill text-left font-size-14 border-radius-6 content-style'.concat(
                        ' ',
                        props.ownMessage
                            ? 'ms-3 normal-btn-hover'
                            : 'background-config-box',
                    )}
                >
                    {props.message}
                </div>
            </div>
            <div
                className={'d-flex justify-content-end text-secondary-color time-style'.concat(
                    ' ',
                    props.ownMessage ? 'ms-3' : '',
                )}
            >
                {props.time}
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
