import './Message.css';
import { getMessageChangeText } from './bl';
import tickIcon from '../../assets/images/tick.svg';
import { MessageProps } from '../../interfaces/props';
import { MessageState } from '@dm3-org/dm3-lib-messaging';

export function MessageDetail(props: MessageProps) {
    return (
        <div className="d-flex justify-content-end pt-1 ps-1 pe-1">
            {getMessageChangeText(props)}
            {new Date(Number(props.time)).toLocaleString()}

            {/* readed message tick indicator */}
            <span className="tick-icon readed-tick-icon">
                {props.ownMessage ? (
                    props.messageState === MessageState.Read ? (
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
                    )
                ) : (
                    <img src={tickIcon} alt="read" />
                )}
            </span>
        </div>
    );
}
