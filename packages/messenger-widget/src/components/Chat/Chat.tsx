import './Chat.css';
import { useContext } from 'react';
import { GlobalContext } from '../../utils/context-utils';
import ConfigProfileAlertBox from '../ContactProfileAlertBox/ContactProfileAlertBox';

export function Chat() {
    const { state } = useContext(GlobalContext);

    return (
        <div
            className={
                state.accounts.selectedContact
                    ? 'highlight-chat-border'
                    : 'highlight-chat-border-none'
            }
        >
            {/* To show information box that contact has not created profile */}
            {!state.accounts.selectedContact?.account.profile
                ?.publicEncryptionKey && <ConfigProfileAlertBox />}

            <div className="mt-3 ms-2 text-primary-color">Chat screen...</div>
        </div>
    );
}
