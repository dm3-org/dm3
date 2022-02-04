import {
    addUserMessage,
    deleteMessages,
    renderCustomComponent,
    Widget,
} from 'react-chat-widget';
import Icon from './Icon';
import { createMessage, MessageState, submitMessage } from './lib/Messaging';
import { ApiConnection, getAccountDisplayName } from './lib/Web3Provider';
import { submitMessage as submitMessageApi } from './external-apis/BackendAPI';
import { prersonalSign } from './external-apis/InjectedWeb3API';
import MessageStateView from './MessageStateView';
import { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';

interface ChatProps {
    hasContacts: boolean;
    selectedAccount: string | undefined;
    ensNames: Map<string, string>;
    apiConnection: ApiConnection;
}

function Chat(props: ChatProps) {
    const [messageStates, setMessageStatess] = useState<
        Map<string, MessageState>
    >(new Map<string, MessageState>());

    const handleNewUserMessage = async (message: any) => {
        deleteMessages(1);
        addUserMessage(message);
        const messageId = uuidv4();
        const messageData = createMessage(
            props.selectedAccount as string,
            message,
        );
        messageStates.set(messageId, MessageState.Created);
        setMessageStatess(new Map(messageStates));

        submitMessage(
            props.apiConnection,
            messageData,
            submitMessageApi,
            prersonalSign,
        ).then(() => {
            messageStates.set(messageId, MessageState.Signed);
            setMessageStatess(new Map(messageStates));
        });

        renderCustomComponent(
            () => (
                <MessageStateView
                    messageState={messageStates.get(messageId) as MessageState}
                    time={messageData.timestamp}
                />
            ),
            {},
        );
    };

    return (
        <>
            {!props.selectedAccount ? (
                <div className="start-chat d-flex align-items-center">
                    <div className="w-100 text-center">
                        <Icon iconClass="fas fa-arrow-left" />{' '}
                        <strong>
                            {props.hasContacts
                                ? 'Select a contact to start'
                                : 'Add a contact to start'}
                        </strong>
                    </div>
                </div>
            ) : (
                <Widget
                    emojis={false}
                    launcher={() => null}
                    subtitle={null}
                    handleNewUserMessage={handleNewUserMessage}
                    showTimeStamp={false}
                    title={`${
                        props.selectedAccount
                            ? getAccountDisplayName(
                                  props.selectedAccount,
                                  props.ensNames,
                              )
                            : ''
                    }`}
                />
            )}
        </>
    );
}

export default Chat;
