import Icon from './Icon';
import * as Lib from './lib';

interface MessageStateViewProps {
    messageState: Lib.MessageState;
    time: number;
    ownMessage: boolean;
    encrypted: boolean;
}

function MessageStateView(props: MessageStateViewProps) {
    return (
        <div
            className={`w-100 rcw-timestamp ${
                props.ownMessage ? 'text-end' : 'text-start'
            } message-state`}
        >
            {new Date(props.time).toLocaleTimeString()}{' '}
            {props.messageState === Lib.MessageState.Created && (
                <Icon iconClass="fas fa-spinner fa-spin" />
            )}
            {props.messageState === Lib.MessageState.Send && (
                <>
                    <Icon iconClass="fas fa-signature" />{' '}
                    {props.encrypted && <Icon iconClass="fas fa-lock" />}
                </>
            )}
            {props.messageState === Lib.MessageState.FailedToSend && (
                <Icon iconClass="fas fa-exclamation-circle error-indication" />
            )}
        </div>
    );
}

export default MessageStateView;
