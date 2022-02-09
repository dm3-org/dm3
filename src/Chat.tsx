import {
    addResponseMessage,
    addUserMessage,
    deleteMessages,
    dropMessages,
    renderCustomComponent,
    Widget,
} from 'react-chat-widget';
import Icon from './Icon';
import {
    createMessage,
    Envelop,
    getMessages,
    Message,
    MessageState,
    submitMessage,
} from './lib/Messaging';
import { ApiConnection, getAccountDisplayName } from './lib/Web3Provider';
import {
    submitMessage as submitMessageApi,
    getMessages as getMessagesApi,
} from './external-apis/BackendAPI';
import { prersonalSign } from './external-apis/InjectedWeb3API';
import MessageStateView from './MessageStateView';
import { useEffect, useState } from 'react';
import { ethers } from 'ethers';

interface ChatProps {
    hasContacts: boolean;
    selectedAccount: string | undefined;
    ensNames: Map<string, string>;
    apiConnection: ApiConnection;
    newMessages: Envelop[];
    setNewMessages: (messages: Envelop[]) => void;
}

function Chat(props: ChatProps) {
    const [messageStates, setMessageStates] = useState<
        Map<string, MessageState>
    >(new Map<string, MessageState>());

    const removeReadMessages = () => {
        props.newMessages.forEach((newEnvelop) => {
            const message = JSON.parse(newEnvelop.message) as Message;

            if (
                props.selectedAccount &&
                ethers.utils.getAddress(message.from) ===
                    ethers.utils.getAddress(props.selectedAccount as string)
            ) {
                handleMessages([newEnvelop]);

                if (
                    props.newMessages.find(
                        (envelop) => envelop.signature === newEnvelop.signature,
                    )
                ) {
                    props.setNewMessages(
                        props.newMessages.filter(
                            (envelop) =>
                                envelop.signature !== newEnvelop.signature,
                        ),
                    );
                }
            }
        });
    };

    useEffect(() => {
        removeReadMessages();
    }, [props.newMessages]);

    const getPastMessages = async () => {
        removeReadMessages();
        handleMessages(
            await getMessages(
                props.apiConnection,
                props.selectedAccount as string,
                getMessagesApi,
            ),
        );
    };

    const handleMessages = async (envelops: Envelop[]) => {
        envelops

            .map((envelop) => JSON.parse(envelop.message) as Message)
            .sort((a, b) => a.timestamp - b.timestamp)
            .forEach((message) => {
                if (message.from === (props.apiConnection.account as string)) {
                    addUserMessage(
                        message.message,
                        message.timestamp.toString(),
                    );
                } else {
                    addResponseMessage(
                        message.message,
                        message.timestamp.toString(),
                    );
                }

                messageStates.set(
                    message.timestamp.toString(),
                    MessageState.Signed,
                );
                setMessageStates(new Map(messageStates));
                renderCustomComponent(
                    () => (
                        <MessageStateView
                            messageState={
                                messageStates.get(
                                    message.timestamp.toString(),
                                ) as MessageState
                            }
                            time={message.timestamp}
                            ownMessage={
                                message.from === props.apiConnection.account
                                    ? true
                                    : false
                            }
                        />
                    ),
                    {},
                );
            });
    };

    useEffect(() => {
        if (props.selectedAccount) {
            dropMessages();
            getPastMessages();
        }
    }, [props.selectedAccount]);

    const handleNewUserMessage = async (message: any) => {
        deleteMessages(1);
        addUserMessage(message);

        const messageData = createMessage(
            props.selectedAccount as string,
            props.apiConnection.account as string,
            message,
        );
        const messageId = messageData.timestamp.toString();
        messageStates.set(messageId, MessageState.Created);
        setMessageStates(new Map(messageStates));

        submitMessage(
            props.apiConnection,
            messageData,
            submitMessageApi,
            prersonalSign,
        ).then(() => {
            messageStates.set(messageId, MessageState.Signed);
            setMessageStates(new Map(messageStates));
        });

        renderCustomComponent(
            () => (
                <MessageStateView
                    messageState={messageStates.get(messageId) as MessageState}
                    time={messageData.timestamp}
                    ownMessage={true}
                />
            ),
            {},
        );
    };

    return (
        <div className="row widget-container">
            <div className="col-12 h-100">
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
            </div>
        </div>
    );
}

export default Chat;
