import { MessageState } from 'dm3-lib-messaging';
import Icon from '../ui-shared/Icon';

interface MessageStateViewProps {
    messageState: MessageState;
    time: number;
    ownMessage: boolean;
}

function MessageStateView(props: MessageStateViewProps) {
    return (
        <div
            className={`w-100 rcw-timestamp ${
                props.ownMessage ? 'text-end' : 'text-start'
            } message-state`}
        >
            {new Date(props.time).toLocaleString()}{' '}
            {props.messageState === MessageState.Created && (
                <Icon iconClass="fas fa-spinner fa-spin" />
            )}
            {props.messageState === MessageState.Read && (
                <>
                    <Icon iconClass="fas fa-check" />
                </>
            )}
            {props.messageState === MessageState.FailedToSend && (
                <Icon iconClass="fas fa-exclamation-circle error-indication" />
            )}
        </div>
    );
}

export default MessageStateView;
