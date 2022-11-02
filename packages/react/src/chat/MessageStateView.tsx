import Icon from '../ui-shared/Icon';
import * as Lib from 'dm3-lib';

interface MessageStateViewProps {
    messageState: Lib.messaging.MessageState;
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
            {props.messageState === Lib.messaging.MessageState.Created && (
                <Icon iconClass="fas fa-spinner fa-spin" />
            )}
            {props.messageState === Lib.messaging.MessageState.Read && (
                <>
                    <Icon iconClass="fas fa-check" />
                </>
            )}
            {props.messageState === Lib.messaging.MessageState.FailedToSend && (
                <Icon iconClass="fas fa-exclamation-circle error-indication" />
            )}
        </div>
    );
}

export default MessageStateView;
