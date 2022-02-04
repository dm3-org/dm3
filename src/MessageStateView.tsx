import Icon from './Icon';
import { MessageState } from './lib/Messaging';

interface MessageStateViewProps {
    messageState: MessageState;
    time: number;
}

function MessageStateView(props: MessageStateViewProps) {
    return (
        <div className="w-100 rcw-timestamp text-end message-state">
            {new Date(props.time).toLocaleTimeString()}{' '}
            {props.messageState === MessageState.Created ? (
                <Icon iconClass="fas fa-spinner fa-spin" />
            ) : (
                <Icon iconClass="fas fa-signature" />
            )}
        </div>
    );
}

export default MessageStateView;
