import Icon from './Icon';
import { MessageState } from './lib/Messaging';

interface MessageStateViewProps {
    messageState: MessageState;
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
            {props.messageState === MessageState.Created ? (
                <Icon iconClass="fas fa-spinner fa-spin" />
            ) : (
                <>
                    <Icon iconClass="fas fa-signature" />{' '}
                    {props.encrypted && <Icon iconClass="fas fa-lock" />}
                </>
            )}
        </div>
    );
}

export default MessageStateView;
