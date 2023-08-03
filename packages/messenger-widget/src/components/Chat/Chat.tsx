import './Chat.css';
import { useContext } from 'react';
import { GlobalContext } from '../../utils/context-utils';

export function Chat() {
    const { state } = useContext(GlobalContext);

    return (
        <div
            className={'text-primary-color'.concat(
                ' ',
                state.accounts.selectedContact
                    ? 'highlight-chat-border'
                    : 'highlight-chat-border-none',
            )}
        >
            Chat screen...
        </div>
    );
}
